import { NextResponse } from "next/server";
import { query } from "../../../lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const result = await query(
    `SELECT city, COUNT(*) AS count FROM provider_profiles GROUP BY city ORDER BY count DESC`
  );
  return NextResponse.json({
    cities: result.rows.map((r) => ({ city: r.city, count: Number(r.count) })),
  });
}
