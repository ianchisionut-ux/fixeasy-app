import { NextResponse } from "next/server";
import { query } from "../../../../lib/db";
import { hashPassword, createSessionToken, SESSION_COOKIE_NAME } from "../../../../lib/auth";

export async function POST(request) {
  try {
    const { email, password, name, phone, role } = await request.json();

    if (!email || !password || !name || !role) {
      return NextResponse.json({ error: "Completeaza toate campurile obligatorii." }, { status: 400 });
    }
    if (!["client", "provider"].includes(role)) {
      return NextResponse.json({ error: "Rol invalid." }, { status: 400 });
    }
    if (password.length < 6) {
      return NextResponse.json({ error: "Parola trebuie sa aiba minim 6 caractere." }, { status: 400 });
    }

    const existing = await query("SELECT id FROM users WHERE email = $1", [email.toLowerCase()]);
    if (existing.rows.length > 0) {
      return NextResponse.json({ error: "Exista deja un cont cu acest email." }, { status: 409 });
    }

    const passwordHash = await hashPassword(password);
    const result = await query(
      `INSERT INTO users (email, password_hash, name, phone, role)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, email, name, role`,
      [email.toLowerCase(), passwordHash, name, phone || null, role]
    );
    const user = result.rows[0];

    // Daca e prestator, ii cream automat un profil de business gol, pe care il completeaza ulterior.
    if (role === "provider") {
      await query(
        `INSERT INTO provider_profiles (user_id, business_name, category, city)
         VALUES ($1, $2, $3, $4)`,
        [user.id, name, "Necompletat", "Necompletat"]
      );
    }

    const token = await createSessionToken(user);
    const response = NextResponse.json({ user }, { status: 201 });
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
    return NextResponse.json({ error: "Eroare la inregistrare." }, { status: 500 });
  }
}
