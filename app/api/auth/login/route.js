import { NextResponse } from "next/server";
import { query } from "../../../../lib/db";
import { verifyPassword, createSessionToken, SESSION_COOKIE_NAME } from "../../../../lib/auth";

export async function POST(request) {
  try {
    const { email, password } = await request.json();
    if (!email || !password) {
      return NextResponse.json({ error: "Completeaza email si parola." }, { status: 400 });
    }

    const result = await query(
      "SELECT id, email, password_hash, name, role FROM users WHERE email = $1",
      [email.toLowerCase()]
    );
    const user = result.rows[0];
    if (!user) {
      return NextResponse.json({ error: "Email sau parola incorecte." }, { status: 401 });
    }

    const valid = await verifyPassword(password, user.password_hash);
    if (!valid) {
      return NextResponse.json({ error: "Email sau parola incorecte." }, { status: 401 });
    }

    const safeUser = { id: user.id, email: user.email, name: user.name, role: user.role };
    const token = await createSessionToken(safeUser);
    const response = NextResponse.json({ user: safeUser });
    response.cookies.set(SESSION_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
    });
    return response;
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Eroare la autentificare." }, { status: 500 });
  }
}
