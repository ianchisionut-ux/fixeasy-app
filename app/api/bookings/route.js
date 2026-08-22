import { NextResponse } from "next/server";
import { listBookings, createBooking } from "../../../lib/store";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const providerId = searchParams.get("providerId");
  const bookings = listBookings(providerId);
  return NextResponse.json({ bookings });
}

export async function POST(request) {
  try {
    const body = await request.json();
    const booking = createBooking(body);
    return NextResponse.json({ booking }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
