import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const body = await req.json();
  const { title, description, topic } = body;

  if (!title || !description || !topic) {
    return NextResponse.json({ message: "Faltan campos obligatorios" }, { status: 400 });
  }

  await new Promise((res) => setTimeout(res, 1000));

  return NextResponse.json({ message: "Notificación enviada correctamente (mock)" });
}
