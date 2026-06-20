import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

export async function POST(req: NextRequest) {
  const { restaurants, turnstileToken } = await req.json();

  if (!restaurants || !restaurants.trim()) {
    return NextResponse.json({ error: "No restaurant name provided" }, { status: 400 });
  }

  const verifyRes = await fetch(
    "https://challenges.cloudflare.com/turnstile/v0/siteverify",
    {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        secret: process.env.TURNSTILE_SECRET_KEY ?? "",
        response: turnstileToken ?? "",
      }),
    }
  );
  const verifyData = await verifyRes.json();
  if (!verifyData.success) {
    return NextResponse.json({ error: "Verification failed" }, { status: 400 });
  }

  const resend = new Resend(process.env.RESEND_API_KEY);

  try {
    await resend.emails.send({
      from: "Wurrynot Suggestions <onboarding@resend.dev>",
      to: "contactwurrynot@gmail.com",
      subject: "New Restaurant Suggestion — Wurrynot",
      html: `
        <h2>New Restaurant Suggestion</h2>
        <p><strong>Suggested restaurants:</strong></p>
        <p style="font-size:16px">${restaurants.replace(/\n/g, "<br/>")}</p>
        <hr/>
        <p style="color:#888;font-size:12px">Submitted via wurrynot.com/forms</p>
      `,
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to send email" }, { status: 500 });
  }
}
