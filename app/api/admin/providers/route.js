import { NextResponse } from "next/server";
import { query } from "../../../../lib/db";
import { getSession } from "../../../../lib/auth";

export async function GET(request) {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Acces interzis." }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.trim();

  const result = q
    ? await query(
        `SELECT pp.id, pp.business_name, pp.category, pp.city, pp.verified, pp.rating, pp.reviews_count, u.email, u.phone
         FROM provider_profiles pp JOIN users u ON u.id = pp.user_id
         WHERE pp.business_name ILIKE $1 OR u.email ILIKE $1 OR pp.city ILIKE $1
         ORDER BY pp.id DESC`,
        [`%${q}%`]
      )
    : await query(
        `SELECT pp.id, pp.business_name, pp.category, pp.city, pp.verified, pp.rating, pp.reviews_count, u.email, u.phone
         FROM provider_profiles pp JOIN users u ON u.id = pp.user_id
         ORDER BY pp.id DESC`
      );

  return NextResponse.json({ providers: result.rows });
}
