import { NextResponse } from "next/server";
import { query } from "../../../../../../../lib/db";
import { getSession } from "../../../../../../../lib/auth";

export async function DELETE(request, { params }) {
  const { serviceId } = await params;
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Acces interzis." }, { status: 403 });
  }
  await query("DELETE FROM services WHERE id = $1", [serviceId]);
  return NextResponse.json({ ok: true });
}
