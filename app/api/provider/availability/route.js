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
    return NextResponse.json({ error: "Doar prestatorii au program." }, { status: 403 });
  }
  const providerId = await getOwnProviderId(session.id);
  if (!providerId) return NextResponse.json({ schedule: [] });

  const result = await query(
    "SELECT weekday, is_working, start_time, end_time FROM provider_availability WHERE provider_id = $1 ORDER BY weekday",
    [providerId]
  );
  return NextResponse.json({ schedule: result.rows });
}

export async function PUT(request) {
  try {
    const session = await getSession();
    if (!session || session.role !== "provider") {
      return NextResponse.json({ error: "Doar prestatorii au program." }, { status: 403 });
    }
    const providerId = await getOwnProviderId(session.id);
    if (!providerId) return NextResponse.json({ error: "Profil inexistent." }, { status: 404 });

    const { schedule } = await request.json();
    if (!Array.isArray(schedule) || schedule.length !== 7) {
      return NextResponse.json({ error: "Program invalid." }, { status: 400 });
    }

    for (const day of schedule) {
      await query(
        `INSERT INTO provider_availability (provider_id, weekday, is_working, start_time, end_time)
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT (provider_id, weekday)
         DO UPDATE SET is_working = $3, start_time = $4, end_time = $5`,
        [providerId, day.weekday, !!day.isWorking, day.startTime || "09:00", day.endTime || "17:00"]
      );
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Eroare la salvarea programului." }, { status: 500 });
  }
}
