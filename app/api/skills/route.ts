import { NextResponse } from "next/server";
import { getSkills, getCategories } from "@/lib/sheets";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    const { skills, isLive } = await getSkills();
    const categories = getCategories(skills);

    return NextResponse.json(
      {
        success: true,
        isLive,
        count: skills.length,
        categories,
        skills,
      },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
        },
      }
    );
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch skills",
      },
      { status: 500 }
    );
  }
}
