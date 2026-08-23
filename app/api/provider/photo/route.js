import { NextResponse } from "next/server";
import { query } from "../../../../lib/db";
import { getSession } from "../../../../lib/auth";

const MAX_SIZE = 1_500_000; // ~1.5MB base64, generos pentru o poza redimensionata client-side

export async function PUT(request) {
  try {
    const session = await getSession();
    if (!session || session.role !== "provider") {
      return NextResponse.json({ error: "Doar prestatorii au poză de profil." }, { status: 403 });
    }
    const { photo } = await request.json();
    if (!photo || !photo.startsWith("data:image/")) {
      return NextResponse.json({ error: "Imagine invalidă." }, { status: 400 });
    }
    if (photo.length > MAX_SIZE) {
      return NextResponse.json({ error: "Imaginea e prea mare." }, { status: 400 });
    }

    const result = await query(
      "UPDATE provider_profiles SET profile_photo = $1 WHERE user_id = $2 RETURNING profile_photo",
      [photo, session.id]
    );
    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Profil inexistent." }, { status: 404 });
    }
    return NextResponse.json({ profilePhoto: result.rows[0].profile_photo });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Eroare la salvarea pozei." }, { status: 500 });
  }
}

export async function DELETE() {
  const session = await getSession();
  if (!session || session.role !== "provider") {
    return NextResponse.json({ error: "Doar prestatorii au poză de profil." }, { status: 403 });
  }
  await query("UPDATE provider_profiles SET profile_photo = NULL WHERE user_id = $1", [session.id]);
  return NextResponse.json({ ok: true });
}
