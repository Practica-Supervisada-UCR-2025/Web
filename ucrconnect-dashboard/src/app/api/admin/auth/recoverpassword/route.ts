import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  
  const body = await request.json();

  const backendResponse = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/recover-password`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  const data = await backendResponse.json();

  return new NextResponse(JSON.stringify(data), {
    status: backendResponse.status,
    headers: { 'Content-Type': 'application/json' },
  });
}