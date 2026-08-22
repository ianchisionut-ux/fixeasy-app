import { NextResponse } from "next/server";
import { query } from "../../../../lib/db";
import { getSession } from "../../../../lib/auth";

async function getOwnProviderId(userId) {
  const result = await query("SELECT id FROM provider_profiles WHERE user_id = $1", [userId]);
  return result.rows[0]?.id || null;
}

export async function GET() {
  const session = await getSession();
  if (!session || session.role !== "provider") {
    return NextResponse.json({ error: "Doar prestatorii au servicii." }, { status: 403 });
  }
  const providerId = await getOwnProviderId(session.id);
  if (!providerId) return NextResponse.json({ services: [] });

  const result = await query(
    "SELECT id, name, price, duration_minutes FROM services WHERE provider_id = $1 ORDER BY id",
    [providerId]
  );
  return NextResponse.json({ services: result.rows });
}

export async function POST(request) {
  try {
    const session = await getSession();
    if (!session || session.role !== "provider") {
      return NextResponse.json({ error: "Doar prestatorii pot adăuga servicii." }, { status: 403 });
    }
    const providerId = await getOwnProviderId(session.id);
    if (!providerId) {
      return NextResponse.json({ error: "Profil de prestator inexistent." }, { status: 404 });
    }

    const { name, price, duration } = await request.json();
    if (!name || price === undefined || price === null || !duration) {
      return NextResponse.json({ error: "Completează numele, prețul și durata." }, { status: 400 });
    }
    if (Number(price) < 0 || Number(duration) <= 0) {
      return NextResponse.json({ error: "Preț sau durată invalide." }, { status: 400 });
    }

    const result = await query(
      `INSERT INTO services (provider_id, name, price, duration_minutes)
       VALUES ($1, $2, $3, $4)
       RETURNING id, name, price, duration_minutes`,
      [providerId, name, price, duration]
    );

    return NextResponse.json({ service: result.rows[0] }, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Eroare la adăugarea serviciului." }, { status: 500 });
  }
}
