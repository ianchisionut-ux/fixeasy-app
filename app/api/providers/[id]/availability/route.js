import { NextResponse } from "next/server";
import { getAvailability } from "../../../../../lib/availability";

export const dynamic = "force-dynamic";

export async function GET(request, { params }) {
  const { id } = await params;
  const { searchParams } = new URL(request.url);
  const days = Math.min(Number(searchParams.get("days")) || 7, 14);

  try {
    const availability = await getAvailability(id, days);
    return NextResponse.json({ availability });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Eroare la calculul disponibilității." }, { status: 500 });
  }
}
