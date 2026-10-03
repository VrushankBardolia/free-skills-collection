"use client";

import { useState } from "react";
import type { Skill } from "@/lib/skills";

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedSkill: Skill | null;
}

export default function ReportModal({
  isOpen,
  onClose,
  selectedSkill,
}: ReportModalProps) {
  const [skillName, setSkillName] = useState(selectedSkill?.name || "");
  const [issueType, setIssueType] = useState("Broken Link / 404");
  const [message, setMessage] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setStatus("idle");
    setErrorMessage("");

    try {
      const res = await fetch("/api/report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          skillName: skillName || selectedSkill?.name || "General Report",
          skillUrl: selectedSkill?.skillMdUrl || "",
          issueType,
          message,
          userEmail,
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setStatus("success");
        setTimeout(() => {
          onClose();
          setStatus("idle");
          setMessage("");
          setUserEmail("");
        }, 2000);
      } else {
        setStatus("error");
        setErrorMessage(data.error || "Failed to submit report. Please try again.");
      }
    } catch {
      setStatus("error");
      setErrorMessage("Network error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-3 sm:p-4 backdrop-blur-xs">
      <div className="relative w-full max-w-md max-h-[92vh] overflow-y-auto rounded-md border border-line bg-paper p-5 sm:p-6 shadow-xl">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-ink-soft hover:text-ink"
        >
          ✕
        </button>

        <h2 className="font-display text-xl font-medium text-ink">
          Report an Issue
        </h2>
        <p className="mt-1 text-xs text-ink-soft">
          Found a broken link or an outdated SKILL.md file? Let us know.
        </p>

        {status === "success" ? (
          <div className="mt-6 rounded border border-emerald-200 bg-emerald-50 p-4 text-center text-sm text-emerald-800">
            ✓ Thank you! Your report has been submitted.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-5 space-y-4">
            {selectedSkill ? (
              <div>
                <label className="block text-xs font-medium text-ink-soft">
                  Skill
                </label>
                <input
                  type="text"
                  disabled
                  value={`${selectedSkill.name} (by ${selectedSkill.author})`}
                  className="mt-1 w-full rounded border border-line bg-line/20 px-3 py-1.5 text-xs text-ink opacity-80"
                />
              </div>
            ) : (
              <div>
                <label className="block text-xs font-medium text-ink-soft">
                  Skill Name / Topic
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., algorithmic-art"
                  value={skillName}
                  onChange={(e) => setSkillName(e.target.value)}
                  className="mt-1 w-full rounded border border-line bg-paper px-3 py-1.5 text-xs text-ink focus:border-clay focus:outline-none"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-ink-soft">
                Issue Type
              </label>
              <select
                value={issueType}
                onChange={(e) => setIssueType(e.target.value)}
                className="mt-1 w-full rounded border border-line bg-paper px-3 py-1.5 text-xs text-ink focus:border-clay focus:outline-none"
              >
                <option value="Broken Link / 404">Broken Link / 404</option>
                <option value="Outdated Instructions">Outdated Instructions</option>
                <option value="Wrong Category or Tags">Wrong Category or Tags</option>
                <option value="Suggest Improvement">Suggest Improvement</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-ink-soft">
                Description / Notes
              </label>
              <textarea
                required
                rows={3}
                placeholder="Please describe what is broken or what should be updated..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="mt-1 w-full rounded border border-line bg-paper px-3 py-1.5 text-xs text-ink focus:border-clay focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-ink-soft">
                Your Email (Optional)
              </label>
              <input
                type="email"
                placeholder="your.email@example.com"
                value={userEmail}
                onChange={(e) => setUserEmail(e.target.value)}
                className="mt-1 w-full rounded border border-line bg-paper px-3 py-1.5 text-xs text-ink focus:border-clay focus:outline-none"
              />
            </div>

            {status === "error" && (
              <p className="text-xs text-red-600">{errorMessage}</p>
            )}

            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="rounded border border-line px-3 py-1.5 text-xs text-ink-soft hover:bg-line/20"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="rounded border border-clay bg-clay px-4 py-1.5 text-xs font-medium text-paper transition-colors hover:bg-clay-dark disabled:opacity-50"
              >
                {isSubmitting ? "Submitting..." : "Submit Report"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
