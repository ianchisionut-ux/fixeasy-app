import { NextResponse } from "next/server";
import { query } from "../../../../../lib/db";
import { getSession } from "../../../../../lib/auth";

export async function DELETE(request, { params }) {
  const { id } = await params;
  const session = await getSession();
  if (!session || session.role !== "provider") {
    return NextResponse.json({ error: "Doar prestatorii pot șterge poze." }, { status: 403 });
  }

  const check = await query(
    `SELECT g.id FROM provider_gallery g
     JOIN provider_profiles pp ON pp.id = g.provider_id
     WHERE g.id = $1 AND pp.user_id = $2`,
    [id, session.id]
  );
  if (check.rows.length === 0) {
    return NextResponse.json({ error: "Imagine inexistentă." }, { status: 404 });
  }

  await query("DELETE FROM provider_gallery WHERE id = $1", [id]);
  return NextResponse.json({ ok: true });
}
