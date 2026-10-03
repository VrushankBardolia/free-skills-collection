import type { Skill } from "@/lib/skills";

const categoryDot: Record<Skill["category"], string> = {
  Development: "bg-moss",
  "Testing & Quality": "bg-emerald-700",
  "DevOps & Cloud": "bg-sky-700",
  "Creative & Design": "bg-clay",
  Documents: "bg-slate",
  "Security & Performance": "bg-amber-700",
  "Enterprise & Management": "bg-ink-soft",
};

interface SkillCardProps {
  skill: Skill;
  onReport?: (skill: Skill) => void;
}

export default function SkillCard({ skill, onReport }: SkillCardProps) {
  return (
    <article className="group flex flex-col justify-between rounded-sm border border-line bg-paper p-5 sm:p-6 transition-all duration-200 hover:-translate-y-0.5 hover:border-clay/60 hover:shadow-sm">
      <div>
        <div className="mb-3 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span
              className={`h-2 w-2 rounded-full ${categoryDot[skill.category] || "bg-ink-soft"}`}
              aria-hidden
            />
            <span className="text-xs font-medium text-ink-soft">{skill.category}</span>
          </div>

          {onReport && (
            <button
              onClick={() => onReport(skill)}
              title="Report broken or missing link"
              className="text-ink-soft/70 hover:text-clay-dark transition-colors p-1 -m-1"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </button>
          )}
        </div>

        <h3 className="font-display text-lg sm:text-xl font-medium text-ink group-hover:text-clay-dark transition-colors break-words">
          {skill.name}
        </h3>
        <p className="mt-2 text-xs sm:text-[14px] leading-relaxed text-ink-soft break-words">
          {skill.description}
        </p>
      </div>

      <div className="mt-5 sm:mt-6 flex items-center justify-between border-t border-line pt-3.5 sm:pt-4 text-xs">
        <span className="font-mono text-ink truncate max-w-[140px] sm:max-w-[170px]" title={`By ${skill.author}`}>
          {`By ${skill.author}`}
        </span>
        <a
          href={skill.skillMdUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="font-medium text-clay-dark underline decoration-clay/40 decoration-1 underline-offset-4 hover:text-clay-dark hover:decoration-clay-dark whitespace-nowrap ml-2"
        >
          SKILL.md ↗
        </a>
      </div>
    </article>
  );
}
