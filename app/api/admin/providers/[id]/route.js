import { NextResponse } from "next/server";
import { query } from "../../../../../lib/db";
import { getSession } from "../../../../../lib/auth";
import { stripDiacritics } from "../../../../../lib/geo";

async function requireAdmin() {
  const session = await getSession();
  if (!session || session.role !== "admin") return null;
  return session;
}

export async function PUT(request, { params }) {
  const { id } = await params;
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Acces interzis." }, { status: 403 });

  try {
    const { businessName, category, city, tags, verified } = await request.json();
    if (!businessName || !category || !city) {
      return NextResponse.json({ error: "Completează numele, categoria și orașul." }, { status: 400 });
    }
    const tagsArray = Array.isArray(tags) ? tags : (tags || "").split(",").map((t) => t.trim()).filter(Boolean);

    const result = await query(
      `UPDATE provider_profiles
       SET business_name = $1, category = $2, city = $3, tags = $4, verified = $5
       WHERE id = $6
       RETURNING id, business_name, category, city, tags, verified`,
      [businessName, category, stripDiacritics(city.trim()), tagsArray, !!verified, id]
    );
    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Prestator inexistent." }, { status: 404 });
    }
    return NextResponse.json({ provider: result.rows[0] });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Eroare la actualizare." }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  const { id } = await params;
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Acces interzis." }, { status: 403 });

  // Stergerea userului cascadeaza automat: provider_profiles -> services/bookings/reviews.
  const providerResult = await query("SELECT user_id FROM provider_profiles WHERE id = $1", [id]);
  const userId = providerResult.rows[0]?.user_id;
  if (!userId) return NextResponse.json({ error: "Prestator inexistent." }, { status: 404 });

  await query("DELETE FROM users WHERE id = $1", [userId]);
  return NextResponse.json({ ok: true });
}
