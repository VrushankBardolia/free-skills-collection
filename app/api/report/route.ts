import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { skillName, skillUrl, issueType, message, userEmail } = body;

    if (!message || !issueType) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    const timestamp = new Date().toISOString();
    const reportUrl = process.env.GOOGLE_SHEET_REPORT_URL || process.env.GOOGLE_SHEET_REPORT_WEBHOOK_URL;
    let savedToSheet = false;

    // 1. Send directly to Google Sheet via Apps Script Web App if configured
    if (reportUrl) {
      try {
        const sheetRes = await fetch(reportUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            timestamp,
            skillName: skillName || "General Report",
            skillUrl: skillUrl || "",
            issueType,
            message,
            userEmail: userEmail || "Anonymous",
          }),
        });

        if (sheetRes.ok) {
          savedToSheet = true;
        } else {
          console.warn("[Report API] Google Sheet webhook returned status:", sheetRes.status);
        }
      } catch (sheetErr) {
        console.error("[Report API] Error posting to Google Sheet webhook:", sheetErr);
      }
    }

    // 2. Optionally send Email via SMTP if configured
    const host = process.env.SMTP_HOST;
    const port = Number(process.env.SMTP_PORT || "465");
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;
    const receiver = process.env.REPORT_RECEIVER_EMAIL || user;

    if (host && user && pass && receiver) {
      try {
        const transporter = nodemailer.createTransport({
          host,
          port,
          secure: port === 465,
          auth: { user, pass },
        });

        const mailOptions = {
          from: `"Skills Collection Reporter" <${user}>`,
          to: receiver,
          replyTo: userEmail || user,
          subject: `[Skills Report] ${issueType} - ${skillName || "General Issue"}`,
          text: `Issue Type: ${issueType}\nSkill: ${skillName}\nSkill URL: ${skillUrl || "N/A"}\nUser Email: ${userEmail || "Anonymous"}\n\nDescription:\n${message}`,
          html: `
            <div style="font-family: sans-serif; line-height: 1.5; color: #1c1917;">
              <h2 style="color: #c2593f;">New Skill Issue Report</h2>
              <p><strong>Issue Type:</strong> ${issueType}</p>
              <p><strong>Skill:</strong> ${skillName}</p>
              <p><strong>SKILL.md URL:</strong> <a href="${skillUrl}">${skillUrl || "N/A"}</a></p>
              <p><strong>User Email:</strong> ${userEmail || "Anonymous"}</p>
              <hr style="border: none; border-top: 1px solid #e7e5e4; margin: 16px 0;" />
              <p><strong>Description:</strong></p>
              <div style="background: #f5f5f4; padding: 12px; border-radius: 4px; white-space: pre-wrap;">${message}</div>
            </div>
          `,
        };

        await transporter.sendMail(mailOptions);
      } catch (emailErr) {
        console.error("[Report API] Error sending email notification:", emailErr);
      }
    }

    if (!reportUrl && (!host || !user || !pass)) {
      console.log("[Report API] Received report (Logged locally):", {
        timestamp,
        skillName,
        skillUrl,
        issueType,
        message,
        userEmail,
      });
    }

    return NextResponse.json({
      success: true,
      savedToSheet,
      message: "Report submitted successfully",
    });
  } catch (error: any) {
    console.error("[Report API] Error processing report:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to process report" },
      { status: 500 }
    );
  }
}
