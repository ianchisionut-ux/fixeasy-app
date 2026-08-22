import { NextResponse } from "next/server";
import { query } from "../../../lib/db";
import { getSession } from "../../../lib/auth";

export const dynamic = "force-dynamic";

export async function GET(request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Trebuie sa fii autentificat." }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const providerId = searchParams.get("providerId");

  // Prestatorul isi vede programarile primite; clientul isi vede propriile programari.
  let result;
  if (session.role === "provider") {
    result = await query(
      `SELECT b.id, b.scheduled_date, b.scheduled_time, b.status,
              u.name AS client_name, u.phone AS client_phone,
              s.name AS service_name, pp.business_name AS provider_name
       FROM bookings b
       JOIN users u ON u.id = b.client_id
       JOIN services s ON s.id = b.service_id
       JOIN provider_profiles pp ON pp.id = b.provider_id
       WHERE pp.user_id = $1
       ORDER BY b.created_at DESC`,
      [session.id]
    );
  } else {
    result = await query(
      `SELECT b.id, b.scheduled_date, b.scheduled_time, b.status,
              u.name AS client_name, u.phone AS client_phone,
              s.name AS service_name, pp.business_name AS provider_name
       FROM bookings b
       JOIN users u ON u.id = b.client_id
       JOIN services s ON s.id = b.service_id
       JOIN provider_profiles pp ON pp.id = b.provider_id
       WHERE b.client_id = $1
       ${providerId ? "AND b.provider_id = $2" : ""}
       ORDER BY b.created_at DESC`,
      providerId ? [session.id, providerId] : [session.id]
    );
  }

  const bookings = result.rows.map((b) => ({
    id: "b" + b.id,
    rawId: b.id,
    providerName: b.provider_name,
    serviceName: b.service_name,
    clientName: b.client_name,
    phone: b.client_phone,
    date: b.scheduled_date,
    time: b.scheduled_time,
    status: b.status,
  }));

  return NextResponse.json({ bookings });
}

export async function POST(request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Trebuie sa fii autentificat ca sa faci o programare." }, { status: 401 });
    }
    if (session.role !== "client") {
      return NextResponse.json({ error: "Doar clientii pot face programari." }, { status: 403 });
    }

    const { providerId, serviceId, date, time } = await request.json();
    if (!providerId || !serviceId || !date || !time) {
      return NextResponse.json({ error: "Date incomplete pentru programare." }, { status: 400 });
    }

    const serviceCheck = await query(
      "SELECT id, provider_id FROM services WHERE id = $1 AND provider_id = $2",
      [serviceId, providerId]
    );
    if (serviceCheck.rows.length === 0) {
      return NextResponse.json({ error: "Serviciu invalid pentru acest prestator." }, { status: 400 });
    }

    const result = await query(
      `INSERT INTO bookings (client_id, provider_id, service_id, scheduled_date, scheduled_time, status)
       VALUES ($1, $2, $3, $4, $5, 'pending')
       RETURNING id, scheduled_date, scheduled_time, status`,
      [session.id, providerId, serviceId, date, time]
    );

    const providerInfo = await query(
      "SELECT business_name FROM provider_profiles WHERE id = $1",
      [providerId]
    );
    const serviceInfo = await query("SELECT name FROM services WHERE id = $1", [serviceId]);

    const row = result.rows[0];
    return NextResponse.json(
      {
        booking: {
          id: "b" + row.id,
          providerName: providerInfo.rows[0]?.business_name,
          serviceName: serviceInfo.rows[0]?.name,
          date: row.scheduled_date,
          time: row.scheduled_time,
          status: row.status,
        },
      },
      { status: 201 }
    );
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Eroare la salvarea programarii." }, { status: 500 });
  }
}
