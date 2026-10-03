export type Category =
  | "Documents"
  | "Creative & Design"
  | "Development"
  | "Testing & Quality"
  | "DevOps & Cloud"
  | "Enterprise & Management"
  | "Security & Performance";

export interface Skill {
  name: string;
  description: string;
  category: Category;
  author: string;
  skillMdUrl: string;
  tags?: string[];
}

export const categories: Category[] = [
  "Development",
  "Testing & Quality",
  "DevOps & Cloud",
  "Creative & Design",
  "Documents",
  "Security & Performance",
  "Enterprise & Management",
];
