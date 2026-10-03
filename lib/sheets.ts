import { categories as defaultCategories, type Skill, type Category } from "./skills";

/**
 * Parses a standard CSV string into rows of string arrays,
 * handling quoted values, commas within quotes, and escaped quotes ("").
 */
export function parseCSV(csvText: string): string[][] {
  const rows: string[][] = [];
  let currentRow: string[] = [];
  let currentVal = "";
  let inQuotes = false;

  for (let i = 0; i < csvText.length; i++) {
    const char = csvText[i];
    const nextChar = csvText[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        // Escaped quote
        currentVal += '"';
        i++;
      } else {
        // Toggle quote state
        inQuotes = !inQuotes;
      }
    } else if (char === "," && !inQuotes) {
      currentRow.push(currentVal.trim());
      currentVal = "";
    } else if ((char === "\r" || char === "\n") && !inQuotes) {
      if (char === "\r" && nextChar === "\n") {
        i++;
      }
      currentRow.push(currentVal.trim());
      // Only push non-empty rows
      if (currentRow.some((c) => c.length > 0)) {
        rows.push(currentRow);
      }
      currentRow = [];
      currentVal = "";
    } else {
      currentVal += char;
    }
  }

  // Push final cell/row if present
  if (currentVal.length > 0 || currentRow.length > 0) {
    currentRow.push(currentVal.trim());
    if (currentRow.some((c) => c.length > 0)) {
      rows.push(currentRow);
    }
  }

  return rows;
}

/**
 * Converts CSV rows into Skill objects by inspecting column headers.
 */
export function parseSkillsFromCSV(csvText: string): Skill[] {
  const rows = parseCSV(csvText);
  if (rows.length < 2) return [];

  const headers = rows[0].map((h) => h.toLowerCase().trim().replace(/[^a-z0-9]/g, ""));

  const nameIdx = headers.findIndex((h) => h === "name" || h === "skillname" || h === "title");
  const descIdx = headers.findIndex((h) => h === "description" || h === "desc" || h === "details");
  const catIdx = headers.findIndex((h) => h === "category" || h === "type");
  const authorIdx = headers.findIndex((h) => h === "author" || h === "creator" || h === "by");
  const urlIdx = headers.findIndex(
    (h) => h === "skillmdurl" || h === "url" || h === "link" || h === "githuburl" || h === "skillurl"
  );
  const tagsIdx = headers.findIndex((h) => h === "tags" || h === "tag" || h === "keywords");

  // If essential columns aren't found, fallback
  if (nameIdx === -1 || descIdx === -1) {
    return [];
  }

  const result: Skill[] = [];

  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const name = row[nameIdx]?.trim();
    const description = row[descIdx]?.trim();

    if (!name || !description) continue;

    const category = (row[catIdx]?.trim() || "Development") as Category;
    const author = row[authorIdx]?.trim() || "Community";
    const skillMdUrl = row[urlIdx]?.trim() || "#";
    const rawTags = row[tagsIdx] || "";
    const tags = rawTags
      ? rawTags
        .split(/[,;|]/)
        .map((t) => t.trim())
        .filter(Boolean)
      : [];

    result.push({
      name,
      description,
      category,
      author,
      skillMdUrl,
      tags: tags.length > 0 ? tags : undefined,
    });
  }

  return result;
}

/**
 * Construct the Google Sheet CSV download URL from Sheet ID or Direct URL
 */
export function getGoogleSheetUrl(): string | null {
  const directUrl = process.env.GOOGLE_SHEET_CSV_URL;
  if (directUrl && directUrl.trim()) {
    return directUrl.trim();
  }

  const sheetId = process.env.GOOGLE_SHEET_ID;
  const sheetGid = process.env.DATA_GID || "0";

  if (sheetId && sheetId.trim()) {
    // Google Sheets GViz CSV export endpoint
    return `https://docs.google.com/spreadsheets/d/${sheetId.trim()}/gviz/tq?tqx=out:csv&gid=${sheetGid.trim()}`;
  }

  return null;
}

/**
 * Fetch skills from Google Sheets with ISR caching (revalidates every 60s).
 * Falls back to static skills if sheet is not configured or fetch fails.
 */
export async function getSkills(): Promise<{ skills: Skill[]; isLive: boolean }> {
  const sheetUrl = getGoogleSheetUrl();

  if (!sheetUrl) {
    return { skills: [], isLive: false };
  }

  try {
    const res = await fetch(sheetUrl, {
      next: { revalidate: 60 }, // Revalidate every 60 seconds
    });

    if (!res.ok) {
      console.warn(`[Google Sheets] Failed to fetch sheet, status: ${res.status}.`);
      return { skills: [], isLive: false };
    }

    const csvText = await res.text();
    const parsedSkills = parseSkillsFromCSV(csvText);

    if (parsedSkills.length === 0) {
      console.warn("[Google Sheets] No skills found in parsed CSV.");
      return { skills: [], isLive: false };
    }

    return { skills: parsedSkills, isLive: true };
  } catch (error) {
    console.error("[Google Sheets] Error fetching skills from Google Sheet:", error);
    return { skills: [], isLive: false };
  }
}

/**
 * Helper to get all categories dynamically based on current skills list
 */
export function getCategories(skillsList: Skill[]): Category[] {
  const catsSet = new Set<Category>();
  // Preserve standard category order first
  defaultCategories.forEach((c) => catsSet.add(c));
  skillsList.forEach((s) => {
    if (s.category) catsSet.add(s.category);
  });
  return Array.from(catsSet);
}
