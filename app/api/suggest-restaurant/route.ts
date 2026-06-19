import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
  const { restaurants } = await req.json();

  if (!restaurants || !restaurants.trim()) {
    return NextResponse.json({ error: "No restaurant name provided" }, { status: 400 });
  }

  try {
    await resend.emails.send({
      from: "Wurrynot Suggestions <onboarding@resend.dev>",
      to: "sonicthesaga1@gmail.com",
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
