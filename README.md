# Free Skills Collection

A Next.js directory of open `SKILL.md` files from Anthropic's public
[anthropics/skills](https://github.com/anthropics/skills) GitHub repository —
searchable and filterable by category, with each card linking straight to its
source file on GitHub.

## Stack
- Next.js 14 (App Router) + TypeScript
- Tailwind CSS, with a warm cream/terracotta palette in the Claude style
- Fraunces (display serif) + Inter (body sans)

## Getting started

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## Editing the skill list

All data lives in `lib/skills.ts` - add, remove, or edit entries there. Each
entry needs a `name`, `description`, `category`, and a link to its `SKILL.md`
file on GitHub.

## Build

```bash
npm run build
npm start
```
