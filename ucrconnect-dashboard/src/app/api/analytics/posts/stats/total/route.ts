import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const accessToken =
    req.cookies.get('access_token')?.value ||
    req.headers.get('authorization')?.replace('Bearer ', '');

  if (!accessToken) {
    return NextResponse.json({ message: 'No autorizado: token no presente' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const interval = searchParams.get('period');
  const startDate = searchParams.get('start_date');
  const endDate = searchParams.get('end_date');

  if (!startDate || !endDate || !interval) {
    return NextResponse.json(
      { message: 'Faltan parámetros requeridos', startDate, endDate, interval },
      { status: 400 }
    );
  }

  const backendUrl = `${process.env.NEXT_PUBLIC_ANALYTICS_URL}/api/analytics/posts/stats/total?start_date=${startDate}&end_date=${endDate}&period=${interval}`;

  try {
    const backendRes = await fetch(backendUrl, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: 'application/json',
      },
    });

    const contentType = backendRes.headers.get('content-type') || '';
    const text = await backendRes.text();

    if (!backendRes.ok) {
      return NextResponse.json(
        { message: 'Error al obtener datos del backend', status: backendRes.status, preview: text.slice(0, 500) },
        { status: 502 }
      );
    }

    if (!contentType.includes('application/json')) {
      return NextResponse.json(
        { message: 'Respuesta del backend no es JSON', contentType, preview: text.slice(0, 500) },
        { status: 502 }
      );
    }

    const data = JSON.parse(text);
    return NextResponse.json({ message: 'Datos obtenidos', data });
  } catch (error) {
    return NextResponse.json({ message: 'Error interno del servidor', error: String(error) }, { status: 500 });
  }
}