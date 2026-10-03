import { NextResponse } from "next/server";
import { getSkills, getCategories } from "@/lib/sheets";

export const revalidate = 60;

export async function GET() {
  try {
    const { skills, isLive } = await getSkills();
    const categories = getCategories(skills);

    return NextResponse.json({
      success: true,
      isLive,
      count: skills.length,
      categories,
      skills,
    });
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
