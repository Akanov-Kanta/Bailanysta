import { NextResponse } from "next/server";

export async function POST(req: Request) {

  const { topic } = await req.json();

  const prompt = topic
    ? `Предложи короткую, оригинальную идею для текстового поста в социальной сети на тему: ${topic}`
    : "Предложи короткую, оригинальную идею для текстового поста в социальной сети";

  const openaiRes = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: "gpt-4",
      messages: [{ role: "user", content: prompt }],
    }),
  });

  const json = await openaiRes.json();

  if (!openaiRes.ok) {
    return NextResponse.json({ error: json }, { status: 500 });
  }

  const suggestion = json?.choices?.[0]?.message?.content?.trim();

  if (!suggestion) {
    return NextResponse.json({ error: "Не удалось получить идею." }, { status: 500 });
  }

  return NextResponse.json({ suggestion });
}
