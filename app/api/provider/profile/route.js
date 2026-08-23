import { NextResponse } from "next/server";
import { query } from "../../../../lib/db";
import { getSession } from "../../../../lib/auth";
import { stripDiacritics } from "../../../../lib/geo";

export async function GET() {
  const session = await getSession();
  if (!session || session.role !== "provider") {
    return NextResponse.json({ error: "Doar prestatorii au profil de business." }, { status: 403 });
  }
  const result = await query(
    "SELECT id, business_name, category, city, tags, verified, rating, reviews_count, profile_photo FROM provider_profiles WHERE user_id = $1",
    [session.id]
  );
  return NextResponse.json({ profile: result.rows[0] || null });
}

export async function PUT(request) {
  try {
    const session = await getSession();
    if (!session || session.role !== "provider") {
      return NextResponse.json({ error: "Doar prestatorii au profil de business." }, { status: 403 });
    }

    const { businessName, category, city, tags } = await request.json();
    if (!businessName || !category || !city) {
      return NextResponse.json({ error: "Completează numele, categoria și orașul." }, { status: 400 });
    }

    const tagsArray = Array.isArray(tags)
      ? tags
      : (tags || "").split(",").map((t) => t.trim()).filter(Boolean);

    const result = await query(
      `UPDATE provider_profiles
       SET business_name = $1, category = $2, city = $3, tags = $4
       WHERE user_id = $5
       RETURNING id, business_name, category, city, tags`,
      [businessName, category, stripDiacritics(city.trim()), tagsArray, session.id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Profil inexistent." }, { status: 404 });
    }

    return NextResponse.json({ profile: result.rows[0] });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Eroare la actualizarea profilului." }, { status: 500 });
  }
}
