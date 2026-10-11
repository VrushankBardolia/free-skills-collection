"use client";

import { useMemo, useState, useEffect } from "react";
import { categories as fallbackCategories, type Category, type Skill } from "@/lib/skills";
import SkillCard from "./SkillCard";
import ReportModal from "./ReportModal";

const ITEMS_PER_PAGE = 12;

interface SkillsExplorerProps {
  initialSkills?: Skill[];
  initialCategories?: Category[];
  isLive?: boolean;
}

export default function SkillsExplorer({
  initialSkills = [],
  initialCategories = fallbackCategories,
  isLive = false,
}: SkillsExplorerProps) {
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<Category | "All">("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [selectedReportSkill, setSelectedReportSkill] = useState<Skill | null>(null);

  // Real-time state
  const [skillsList, setSkillsList] = useState<Skill[]>(initialSkills || []);
  const [categoriesList, setCategoriesList] = useState<Category[]>(
    initialCategories && initialCategories.length > 0 ? initialCategories : fallbackCategories
  );
  const [isSyncing, setIsSyncing] = useState(false);
  const [hasLiveSource, setHasLiveSource] = useState(isLive);

  // Keep state updated if server props change
  useEffect(() => {
    if (initialSkills && initialSkills.length > 0) {
      setSkillsList(initialSkills);
    }
  }, [initialSkills]);

  useEffect(() => {
    if (initialCategories && initialCategories.length > 0) {
      setCategoriesList(initialCategories);
    }
  }, [initialCategories]);

  // Real-time fetch function to pull fresh data from Google Sheet
  const fetchLatestSkills = async (showLoadingState = false) => {
    if (showLoadingState) setIsSyncing(true);
    try {
      const res = await fetch(`/api/skills?_t=${Date.now()}`, {
        cache: "no-store",
      });
      if (!res.ok) return;
      const data = await res.json();
      if (data.success && Array.isArray(data.skills)) {
        setSkillsList(data.skills);
        if (data.categories && Array.isArray(data.categories)) {
          setCategoriesList(data.categories);
        }
        if (typeof data.isLive === "boolean") {
          setHasLiveSource(data.isLive);
        }
      }
    } catch (err) {
      console.warn("[SkillsExplorer] Real-time sync error:", err);
    } finally {
      if (showLoadingState) setIsSyncing(false);
    }
  };

  // Periodic polling & Tab-focus revalidation for realtime updates
  useEffect(() => {
    // 1. Initial background fetch to verify freshness immediately
    fetchLatestSkills();

    // 2. Poll every 15 seconds in background
    const interval = setInterval(() => {
      fetchLatestSkills();
    }, 15000);

    // 3. Immediately sync when user returns to this browser tab
    const handleFocus = () => {
      fetchLatestSkills();
    };
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        fetchLatestSkills();
      }
    };

    window.addEventListener("focus", handleFocus);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      clearInterval(interval);
      window.removeEventListener("focus", handleFocus);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  // Filter skills based on category and search query
  const filtered = useMemo(() => {
    return skillsList.filter((skill) => {
      const matchesCategory =
        activeCategory === "All" || skill.category === activeCategory;
      const q = query.trim().toLowerCase();
      const matchesQuery =
        q.length === 0 ||
        skill.name.toLowerCase().includes(q) ||
        skill.description.toLowerCase().includes(q) ||
        skill.author.toLowerCase().includes(q) ||
        (skill.tags && skill.tags.some((t) => t.toLowerCase().includes(q)));
      return matchesCategory && matchesQuery;
    });
  }, [skillsList, query, activeCategory]);

  // Reset page to 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [query, activeCategory]);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE) || 1;

  // Sliced skills for current page
  const paginatedSkills = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filtered.slice(start, start + ITEMS_PER_PAGE);
  }, [filtered, currentPage]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    const explorerEl = document.getElementById("skills-section");
    if (explorerEl) {
      explorerEl.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const handleOpenReport = (skill?: Skill) => {
    setSelectedReportSkill(skill || null);
    setIsReportOpen(true);
  };

  return (
    <div id="skills-section">
      {/* Controls: Category Dropdown, Search Input & Live Sync Button */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {/* Category Dropdown & Reset */}
        <div className="flex items-center gap-2 flex-wrap">
          <label htmlFor="category-select" className="text-xs font-medium text-ink-soft whitespace-nowrap">
            Category:
          </label>
          <div className="relative max-w-full">
            <select
              id="category-select"
              value={activeCategory}
              onChange={(e) => setActiveCategory(e.target.value as Category | "All")}
              className="appearance-none rounded-sm border border-line bg-paper py-2 pl-3 pr-8 text-xs sm:text-sm text-ink focus:border-clay focus:outline-none cursor-pointer max-w-full"
            >
              <option value="All">All Categories ({skillsList.length})</option>
              {categoriesList.map((cat) => {
                const count = skillsList.filter((s) => s.category === cat).length;
                return (
                  <option key={cat} value={cat}>
                    {cat} ({count})
                  </option>
                );
              })}
            </select>
            <div className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-ink-soft">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>

          {(activeCategory !== "All" || query) && (
            <button
              onClick={() => {
                setActiveCategory("All");
                setQuery("");
              }}
              className="text-xs text-clay-dark underline decoration-clay/40 hover:decoration-clay-dark transition-colors whitespace-nowrap"
            >
              Reset filters
            </button>
          )}
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-72 md:w-80">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search skills, authors, tags…"
            className="w-full rounded-sm border border-line bg-paper px-3.5 py-2 text-xs sm:text-sm text-ink placeholder:text-ink-soft/70 focus:border-clay focus:outline-none"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-ink-soft hover:text-ink"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Skill Cards Grid */}
      {paginatedSkills.length > 0 ? (
        <>
          <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 sm:gap-5">
            {paginatedSkills.map((skill) => (
              <SkillCard
                key={`${skill.author}-${skill.name}`}
                skill={skill}
                onReport={handleOpenReport}
              />
            ))}
          </div>

          {/* Pagination Controls & Results Stats */}
          <div className="mt-8 flex flex-col items-center justify-between gap-4 text-xs text-ink-soft sm:flex-row">
            <div className="text-center sm:text-left">
              <p>
                Showing{" "}
                <span className="font-semibold text-ink">
                  {filtered.length === 0
                    ? "0"
                    : `${(currentPage - 1) * ITEMS_PER_PAGE + 1}-${Math.min(
                      currentPage * ITEMS_PER_PAGE,
                      filtered.length
                    )}`}
                </span>{" "}
                of {filtered.length} skills
                {activeCategory !== "All" && ` in "${activeCategory}"`}
              </p>
            </div>

            {totalPages > 1 && (
              <div className="flex flex-wrap items-center justify-center gap-1.5 text-sm">
                {/* Previous Button */}
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className={`rounded-sm border border-line px-2.5 py-1.5 text-xs sm:text-sm sm:px-3 transition-colors ${currentPage === 1
                    ? "cursor-not-allowed opacity-40 text-ink-soft"
                    : "bg-paper text-ink hover:border-clay hover:text-clay-dark"
                    }`}
                >
                  ← Prev
                </button>

                {/* Page Numbers */}
                <div className="flex items-center gap-1 flex-wrap justify-center">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`h-8 min-w-[32px] sm:h-9 sm:min-w-[36px] rounded-sm border px-2 text-xs sm:text-sm font-medium transition-colors ${currentPage === page
                        ? "border-clay bg-clay text-paper"
                        : "border-line bg-paper text-ink hover:border-clay/60 hover:text-clay-dark"
                        }`}
                    >
                      {page}
                    </button>
                  ))}
                </div>

                {/* Next Button */}
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className={`rounded-sm border border-line px-2.5 py-1.5 text-xs sm:text-sm sm:px-3 transition-colors ${currentPage === totalPages
                    ? "cursor-not-allowed opacity-40 text-ink-soft"
                    : "bg-paper text-ink hover:border-clay hover:text-clay-dark"
                    }`}
                >
                  Next →
                </button>
              </div>
            )}
          </div>
        </>
      ) : (
        <div className="mt-16 flex flex-col items-center gap-2 rounded-sm border border-dashed border-line p-12 text-center">
          <p className="font-display text-lg text-ink">No skills match that search</p>
          <p className="text-sm text-ink-soft">
            Try a different keyword or reset the category filter.
          </p>
          <button
            onClick={() => {
              setActiveCategory("All");
              setQuery("");
            }}
            className="mt-3 rounded-sm border border-clay bg-clay px-4 py-1.5 text-xs text-paper transition-colors hover:bg-clay-dark"
          >
            Reset Filters
          </button>
        </div>
      )}

      {/* Report an Issue Modal */}
      <ReportModal
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
        selectedSkill={selectedReportSkill}
      />
    </div>
  );
}
