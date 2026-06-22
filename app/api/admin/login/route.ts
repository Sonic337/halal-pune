import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { password } = await req.json();

  if (!password) {
    return NextResponse.json({ error: "Incorrect password" }, { status: 401 });
  }

  let sessionValue: string;
  let role: "admin" | "editor";

  if (password === process.env.ADMIN_PASSWORD) {
    sessionValue = "authenticated";
    role = "admin";
  } else if (password === process.env.EDITOR_PASSWORD) {
    sessionValue = "editor";
    role = "editor";
  } else {
    return NextResponse.json({ error: "Incorrect password" }, { status: 401 });
  }

  const res = NextResponse.json({ success: true, role });
  res.cookies.set("admin_session", sessionValue, {
    httpOnly: true,
    maxAge: 60 * 60 * 8,
    path: "/",
    sameSite: "lax",
  });
  return res;
}
