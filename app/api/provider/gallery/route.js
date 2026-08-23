import { NextResponse } from "next/server";
import { query } from "../../../../lib/db";
import { getSession } from "../../../../lib/auth";

const MAX_SIZE = 1_500_000;
const MAX_IMAGES = 12;

async function getOwnProviderId(userId) {
  const result = await query("SELECT id FROM provider_profiles WHERE user_id = $1", [userId]);
  return result.rows[0]?.id || null;
}

export async function GET() {
  const session = await getSession();
  if (!session || session.role !== "provider") {
    return NextResponse.json({ error: "Doar prestatorii au galerie." }, { status: 403 });
  }
  const providerId = await getOwnProviderId(session.id);
  if (!providerId) return NextResponse.json({ images: [] });

  const result = await query(
    "SELECT id, image_data, caption FROM provider_gallery WHERE provider_id = $1 ORDER BY sort_order, id",
    [providerId]
  );
  return NextResponse.json({ images: result.rows });
}

export async function POST(request) {
  try {
    const session = await getSession();
    if (!session || session.role !== "provider") {
      return NextResponse.json({ error: "Doar prestatorii pot adăuga poze." }, { status: 403 });
    }
    const providerId = await getOwnProviderId(session.id);
    if (!providerId) {
      return NextResponse.json({ error: "Profil de prestator inexistent." }, { status: 404 });
    }

    const countResult = await query("SELECT COUNT(*) FROM provider_gallery WHERE provider_id = $1", [providerId]);
    if (Number(countResult.rows[0].count) >= MAX_IMAGES) {
      return NextResponse.json({ error: `Poți adăuga maxim ${MAX_IMAGES} poze în galerie.` }, { status: 400 });
    }

    const { imageData, caption } = await request.json();
    if (!imageData || !imageData.startsWith("data:image/")) {
      return NextResponse.json({ error: "Imagine invalidă." }, { status: 400 });
    }
    if (imageData.length > MAX_SIZE) {
      return NextResponse.json({ error: "Imaginea e prea mare." }, { status: 400 });
    }

    const result = await query(
      `INSERT INTO provider_gallery (provider_id, image_data, caption)
       VALUES ($1, $2, $3)
       RETURNING id, image_data, caption`,
      [providerId, imageData, (caption || "").trim() || null]
    );

    return NextResponse.json({ image: result.rows[0] }, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Eroare la adăugarea pozei." }, { status: 500 });
  }
}
