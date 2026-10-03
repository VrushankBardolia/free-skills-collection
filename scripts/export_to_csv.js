const fs = require("fs");
const path = require("path");

const content = fs.readFileSync(path.join(__dirname, "../lib/skills.ts"), "utf-8");

// Simple regex parser for the TS objects in lib/skills.ts
const skillBlocks = content.split(/\{\s*name:/).slice(1);

const escapeCsv = (str) => {
  if (!str) return '""';
  const clean = str.replace(/"/g, '""').replace(/\r?\n|\r/g, " ");
  return `"${clean}"`;
};

const rows = [["name", "description", "category", "author", "skillMdUrl", "tags"]];

for (const block of skillBlocks) {
  const nameMatch = block.match(/^\s*"([^"]+)"/);
  const descMatch = block.match(/description:\s*"([^"]+)"/);
  const catMatch = block.match(/category:\s*"([^"]+)"/);
  const authorMatch = block.match(/author:\s*"([^"]+)"/);
  const urlMatch = block.match(/skillMdUrl:\s*"([^"]+)"/);
  const tagsMatch = block.match(/tags:\s*\[([^\]]+)\]/);

  if (nameMatch && descMatch) {
    const name = nameMatch[1];
    const desc = descMatch[1];
    const cat = catMatch ? catMatch[1] : "Development";
    const author = authorMatch ? authorMatch[1] : "Anthropic";
    const url = urlMatch ? urlMatch[1] : "";
    let tags = "";
    if (tagsMatch) {
      tags = tagsMatch[1]
        .split(",")
        .map((t) => t.replace(/["'\s]/g, ""))
        .filter(Boolean)
        .join(", ");
    }

    rows.push([name, desc, cat, author, url, tags]);
  }
}

const csvContent = rows
  .map((row) => row.map((val) => escapeCsv(val)).join(","))
  .join("\n");

fs.writeFileSync(path.join(__dirname, "../public/skills_dataset.csv"), csvContent);
console.log(`Successfully exported ${rows.length - 1} skills to public/skills_dataset.csv`);
