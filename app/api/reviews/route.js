import { NextResponse } from "next/server";
import { query } from "../../../lib/db";
import { getSession } from "../../../lib/auth";

export async function POST(request) {
  try {
    const session = await getSession();
    if (!session || session.role !== "client") {
      return NextResponse.json({ error: "Doar clienții pot lăsa recenzii." }, { status: 403 });
    }

    const { bookingId, rating, comment } = await request.json();
    const ratingNum = Number(rating);
    if (!bookingId || !ratingNum || ratingNum < 1 || ratingNum > 5) {
      return NextResponse.json({ error: "Alege o notă între 1 și 5 stele." }, { status: 400 });
    }

    const bookingResult = await query(
      "SELECT id, client_id, provider_id, status FROM bookings WHERE id = $1",
      [bookingId]
    );
    const booking = bookingResult.rows[0];
    if (!booking || booking.client_id !== session.id) {
      return NextResponse.json({ error: "Programare inexistentă." }, { status: 404 });
    }
    if (booking.status !== "completed") {
      return NextResponse.json({ error: "Poți lăsa o recenzie doar după ce lucrarea e finalizată." }, { status: 400 });
    }

    const existing = await query("SELECT id FROM reviews WHERE booking_id = $1", [bookingId]);
    if (existing.rows.length > 0) {
      return NextResponse.json({ error: "Ai lăsat deja o recenzie pentru această programare." }, { status: 409 });
    }

    await query(
      `INSERT INTO reviews (booking_id, client_id, provider_id, rating, comment)
       VALUES ($1, $2, $3, $4, $5)`,
      [bookingId, session.id, booking.provider_id, ratingNum, (comment || "").trim() || null]
    );

    // Recalculeaza media si numarul de recenzii afisate pe profilul prestatorului.
    await query(
      `UPDATE provider_profiles
       SET rating = (SELECT ROUND(AVG(rating)::numeric, 1) FROM reviews WHERE provider_id = $1),
           reviews_count = (SELECT COUNT(*) FROM reviews WHERE provider_id = $1)
       WHERE id = $1`,
      [booking.provider_id]
    );

    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Eroare la salvarea recenziei." }, { status: 500 });
  }
}
