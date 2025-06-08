import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const token = request.cookies.get('access_token')?.value;

  if (!token) {
    return NextResponse.json({ message: 'No se pudo obtener el token' }, { status: 401 });
  }

  const body = await request.json();

  const backendResponse = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/admin/auth/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });

  const data = await backendResponse.json();

  return new NextResponse(JSON.stringify(data), {
    status: backendResponse.status,
    headers: { 'Content-Type': 'application/json' },
  });
}