import SkillsExplorer from "@/components/SkillsExplorer";
import { getSkills, getCategories } from "@/lib/sheets";
import Image from "next/image";

// Revalidate Google Sheet data every 60 seconds (Next.js ISR)
export const revalidate = 60;

export default async function Home() {
  const { skills, isLive } = await getSkills();
  const dynamicCategories = getCategories(skills);

  return (
    <main className="mx-auto max-w-content px-4 py-10 sm:px-8 sm:py-14 lg:px-12 lg:py-16">
      <header className="max-w-3xl">
        {/* Decorated Heading */}
        <h1 className="mt-2 font-display text-3xl leading-[1.15] tracking-tight text-ink sm:text-4xl md:text-5xl lg:text-6xl">
          Free{" "}
          <span className="relative inline-block italic font-normal text-clay-dark">
            Skills
            <svg
              className="absolute -bottom-1 left-0 w-full text-clay/35 pointer-events-none"
              height="8"
              viewBox="0 0 100 8"
              fill="none"
              preserveAspectRatio="none"
            >
              <path
                d="M1 5.5C25 1.5 75 1.5 99 5.5"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
            </svg>
          </span>{" "}
          Collection
        </h1>

        <p className="mt-3 text-base leading-relaxed text-ink-soft sm:mt-4 sm:text-lg">
          A curated collection of open-source{" "}
          <code className="rounded bg-line/50 px-1.5 py-0.5 text-xs font-mono text-ink sm:text-sm">
            SKILL.md
          </code>{" "}
          skills published by Anthropic and top community creators on GitHub.
          Each skill equips AI coding agents with modular workflows, instructions,
          and best practices.
        </p>
      </header>

      <section className="mt-6 sm:mt-8">
        <SkillsExplorer
          initialSkills={skills}
          initialCategories={dynamicCategories}
          isLive={isLive}
        />
      </section>

      <footer className="mt-14 border-t border-line/80 pt-8 pb-12 text-sm text-ink-soft sm:mt-16 sm:pt-10">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 md:gap-12 items-start">
          {/* Brand & Compatible Agents */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <span className="font-display text-lg font-semibold tracking-tight text-ink sm:text-xl">
                Free <span className="italic font-normal text-clay-dark">Skills</span> Collection
              </span>
              <span className="rounded-full border border-moss/30 bg-moss/10 px-2.5 py-0.5 text-[10px] font-medium text-moss">
                Open Source
              </span>
            </div>

            <div className="flex flex-col gap-1.5">
              <span className="text-[11px] font-medium uppercase tracking-wider text-ink-soft/80">
                Compatible with:
              </span>
              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 text-xs text-ink">
                {/* Claude */}
                <div className="flex items-center gap-2 rounded-sm border border-line bg-paper px-2.5 py-1.5 shadow-sm transition-all hover:border-clay/60 hover:-translate-y-0.5">
                  <Image
                    src="https://upload.wikimedia.org/wikipedia/commons/b/b0/Claude_AI_symbol.svg"
                    alt="Claude"
                    width={18}
                    height={18}
                    unoptimized
                  />
                  <span className="font-medium">Claude</span>
                </div>

                {/* Google Antigravity */}
                <div className="flex items-center gap-2 rounded-sm border border-line bg-paper px-2.5 py-1.5 shadow-sm transition-all hover:border-clay/60 hover:-translate-y-0.5">
                  <Image
                    src="https://static.wikia.nocookie.net/logopedia/images/4/4a/Google_Antigravity_icon.svg"
                    alt="Google Antigravity"
                    width={18}
                    height={18}
                    unoptimized
                  />
                  <span className="font-medium">Antigravity</span>
                </div>

                {/* Cursor */}
                <div className="flex items-center gap-2 rounded-sm border border-line bg-paper px-2.5 py-1.5 shadow-sm transition-all hover:border-clay/60 hover:-translate-y-0.5">
                  <Image
                    src="https://uxwing.com/wp-content/themes/uxwing/download/brands-and-social-media/cursor-ai-code-icon.png"
                    alt="Cursor AI"
                    width={18}
                    height={18}
                    unoptimized
                  />
                  <span className="font-medium">Cursor</span>
                </div>

                {/* & more badge */}
                <div
                  title="Also supports Windsurf, Roo Code, Cline, and any SKILL.md compatible agent"
                  className="flex items-center gap-1.5 rounded-sm border border-dashed border-line bg-paper/60 px-2.5 py-1.5 text-xs text-ink-soft hover:border-clay/60 hover:text-ink transition-colors cursor-default"
                >
                  <span className="font-medium text-ink-soft/90">& more…</span>
                </div>
              </div>
            </div>
          </div>

          {/* Community & Feedback */}
          <div className="flex flex-col gap-3 md:items-end md:text-right">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-ink">
              Community & Feedback
            </h3>
            <p className="max-w-sm text-xs leading-relaxed text-ink-soft">
              Found an issue or want to report a broken link? Click the flag icon on any skill card to notify us directly.
            </p>
            <div className="pt-1">
              <a
                href="#skills-section"
                className="inline-flex items-center gap-1 text-xs font-medium text-clay-dark underline decoration-clay/40 underline-offset-4 hover:decoration-clay-dark transition-colors"
              >
                ↑ Back to top
              </a>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
