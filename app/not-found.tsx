"use client";

import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-[90vh] flex-col items-center justify-center px-4 py-16 sm:px-8 text-center">
      <div className="relative max-w-lg">
        <h1 className="font-display text-6xl tracking-tight text-ink sm:text-7xl lg:text-8xl">
          4
          <span className="text-clay-dark inline-block">
            0
          </span>
          4
        </h1>

        <h2 className="mt-4 font-display text-2xl font-medium tracking-tight text-ink sm:text-3xl">
          Skill Not Found
        </h2>

        <p className="mt-3 text-sm leading-relaxed text-ink-soft sm:text-base">
          Looks like this instruction led into uncharted territory. The page or skill you are looking for might have moved, been renamed, or does not exist.
        </p>

        <Link
          href="/"
          className="w-full mt-4 sm:w-auto inline-flex items-center justify-center gap-2 rounded-sm border border-clay bg-clay px-6 py-2.5 text-sm font-medium text-paper transition-all hover:bg-clay-dark hover:shadow-sm"
        >
          ← Explore Skills Directory
        </Link>
      </div>
    </main>
  );
}
