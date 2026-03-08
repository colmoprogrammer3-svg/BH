import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET(request: Request) {
  const cookieStore = await cookies();
  cookieStore.set("couple_id", "", { httpOnly: true, path: "/", maxAge: 0 });
  cookieStore.set("role", "", { httpOnly: true, path: "/", maxAge: 0 });
  
  const url = new URL(request.url);
  url.pathname = "/enter";
  url.search = "";
  url.hash = "";
  return NextResponse.redirect(url);
}

export async function POST(request: Request) {
  const cookieStore = await cookies();
  cookieStore.set("couple_id", "", { httpOnly: true, path: "/", maxAge: 0 });
  cookieStore.set("role", "", { httpOnly: true, path: "/", maxAge: 0 });
  
  const url = new URL(request.url);
  url.pathname = "/enter";
  url.search = "";
  url.hash = "";
  return NextResponse.redirect(url);
}
