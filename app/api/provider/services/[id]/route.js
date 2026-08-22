import { NextResponse } from "next/server";
import { query } from "../../../../../lib/db";
import { getSession } from "../../../../../lib/auth";

async function ownsService(userId, serviceId) {
  const result = await query(
    `SELECT s.id FROM services s
     JOIN provider_profiles pp ON pp.id = s.provider_id
     WHERE s.id = $1 AND pp.user_id = $2`,
    [serviceId, userId]
  );
  return result.rows.length > 0;
}

export async function PUT(request, { params }) {
  const { id } = await params;
  try {
    const session = await getSession();
    if (!session || session.role !== "provider") {
      return NextResponse.json({ error: "Doar prestatorii pot edita servicii." }, { status: 403 });
    }
    if (!(await ownsService(session.id, id))) {
      return NextResponse.json({ error: "Serviciu inexistent." }, { status: 404 });
    }

    const { name, price, duration } = await request.json();
    if (!name || price === undefined || price === null || !duration) {
      return NextResponse.json({ error: "Completează numele, prețul și durata." }, { status: 400 });
    }

    const result = await query(
      `UPDATE services SET name = $1, price = $2, duration_minutes = $3
       WHERE id = $4
       RETURNING id, name, price, duration_minutes`,
      [name, price, duration, id]
    );
    return NextResponse.json({ service: result.rows[0] });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Eroare la actualizarea serviciului." }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  const { id } = await params;
  const session = await getSession();
  if (!session || session.role !== "provider") {
    return NextResponse.json({ error: "Doar prestatorii pot șterge servicii." }, { status: 403 });
  }
  if (!(await ownsService(session.id, id))) {
    return NextResponse.json({ error: "Serviciu inexistent." }, { status: 404 });
  }
  await query("DELETE FROM services WHERE id = $1", [id]);
  return NextResponse.json({ ok: true });
}
