import { NextResponse } from "next/server";
import { listProviders } from "../../../lib/store";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category");
  const providers = listProviders(category);
  return NextResponse.json({ providers });
}
