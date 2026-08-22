import { NextResponse } from "next/server";
import { query } from "../../../../lib/db";
import { getSession } from "../../../../lib/auth";

const ALLOWED = ["confirmed", "cancelled", "completed"];

export async function PATCH(request, { params }) {
  const { id } = await params;
  try {
    const session = await getSession();
    if (!session || session.role !== "provider") {
      return NextResponse.json({ error: "Doar prestatorii pot modifica statusul." }, { status: 403 });
    }

    const { status } = await request.json();
    if (!ALLOWED.includes(status)) {
      return NextResponse.json({ error: "Status invalid." }, { status: 400 });
    }

    // Verifica ca programarea apartine unui profil al acestui prestator.
    const check = await query(
      `SELECT b.id FROM bookings b
       JOIN provider_profiles pp ON pp.id = b.provider_id
       WHERE b.id = $1 AND pp.user_id = $2`,
      [id, session.id]
    );
    if (check.rows.length === 0) {
      return NextResponse.json({ error: "Programare inexistentă." }, { status: 404 });
    }

    const result = await query(
      "UPDATE bookings SET status = $1 WHERE id = $2 RETURNING id, status",
      [status, id]
    );

    return NextResponse.json({ booking: result.rows[0] });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Eroare la actualizarea programării." }, { status: 500 });
  }
}
