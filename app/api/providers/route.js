import { NextResponse } from "next/server";
import { query } from "../../../lib/db";

export const dynamic = "force-dynamic";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category");
  const city = searchParams.get("city");

  const conditions = [];
  const params = [];
  if (category && category !== "Toți") {
    params.push(category);
    conditions.push(`category = $${params.length}`);
  }
  if (city && city !== "Toate orașele") {
    params.push(city);
    conditions.push(`city = $${params.length}`);
  }
  const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

  const providersResult = await query(
    `SELECT id, business_name, category, city, tags, verified, rating, reviews_count
     FROM provider_profiles ${where} ORDER BY rating DESC`,
    params
  );

  const providerIds = providersResult.rows.map((p) => p.id);
  let servicesByProvider = {};
  if (providerIds.length > 0) {
    const servicesResult = await query(
      `SELECT id, provider_id, name, price, duration_minutes
       FROM services WHERE provider_id = ANY($1::int[]) ORDER BY id`,
      [providerIds]
    );
    servicesByProvider = servicesResult.rows.reduce((acc, s) => {
      (acc[s.provider_id] ||= []).push({
        id: String(s.id),
        name: s.name,
        price: Number(s.price),
        duration: s.duration_minutes,
      });
      return acc;
    }, {});
  }

  const providers = providersResult.rows.map((p) => ({
    id: String(p.id),
    name: p.business_name,
    cat: p.category,
    city: p.city,
    rating: Number(p.rating),
    reviews: p.reviews_count,
    priceFrom: Math.min(...(servicesByProvider[p.id]?.map((s) => s.price).filter((x) => x > 0) || [0])) || 0,
    tags: p.tags || [],
    init: p.business_name
      .split(" ")
      .map((w) => w[0])
      .join("")
      .slice(0, 2)
      .toUpperCase(),
    services: servicesByProvider[p.id] || [],
  }));

  return NextResponse.json({ providers });
}
