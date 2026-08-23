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
    return NextResponse.json({ error: "Doar prestatorii au blocări." }, { status: 403 });
  }
  const providerId = await getOwnProviderId(session.id);
  if (!providerId) return NextResponse.json({ blocks: [] });

  const result = await query(
    `SELECT id, off_date, start_time, end_time, reason FROM provider_time_off
     WHERE provider_id = $1 AND off_date >= CURRENT_DATE ORDER BY off_date`,
    [providerId]
  );
  return NextResponse.json({ blocks: result.rows });
}

export async function POST(request) {
  try {
    const session = await getSession();
    if (!session || session.role !== "provider") {
      return NextResponse.json({ error: "Doar prestatorii pot adăuga blocări." }, { status: 403 });
    }
    const providerId = await getOwnProviderId(session.id);
    if (!providerId) return NextResponse.json({ error: "Profil inexistent." }, { status: 404 });

    const { date, startTime, endTime, reason } = await request.json();
    if (!date) {
      return NextResponse.json({ error: "Alege o dată." }, { status: 400 });
    }

    const result = await query(
      `INSERT INTO provider_time_off (provider_id, off_date, start_time, end_time, reason)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, off_date, start_time, end_time, reason`,
      [providerId, date, startTime || null, endTime || null, (reason || "").trim() || null]
    );

    return NextResponse.json({ block: result.rows[0] }, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Eroare la adăugarea blocării." }, { status: 500 });
  }
}
