// app/api/analytics/posts-stats/volume/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const accessToken = req.cookies.get('access_token')?.value;

  if (!accessToken) {
    return NextResponse.json(
      { message: 'No autorizado: token no presente' },
      { status: 401 }
    );
  }

  const { searchParams } = new URL(req.url);
  const interval = searchParams.get('interval');
  const startDate = searchParams.get('startDate');
  const endDate = searchParams.get('endDate');

  if (!interval || !startDate || !endDate) {
    return NextResponse.json(
      { message: 'Faltan parámetros requeridos: interval, startDate, endDate' },
      { status: 400 }
    );
  }

  const backendUrl = `${process.env.NEXT_PUBLIC_ANALYTICS_URL}/api/analytics/posts-stats/volume?interval=${interval}&startDate=${startDate}&endDate=${endDate}`;

  try {
    const backendRes = await fetch(backendUrl, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: 'application/json',
      },
    });

    const contentType = backendRes.headers.get('content-type') || '';

    if (!backendRes.ok) {
      const text = await backendRes.text();
      console.error('Backend responded with error:', {
        status: backendRes.status,
        statusText: backendRes.statusText,
        contentType,
        bodyPreview: text.slice(0, 500),
      });

      return NextResponse.json(
        {
          message: 'Error al obtener datos del backend',
          status: backendRes.status,
          statusText: backendRes.statusText,
          contentType,
          backendResponsePreview: text.slice(0, 500),
        },
        { status: 502 }
      );
    }

    if (!contentType.includes('application/json')) {
      const text = await backendRes.text();
      console.error('Backend response is not JSON:', {
        contentType,
        bodyPreview: text.slice(0, 500),
      });

      return NextResponse.json(
        {
          message: 'Respuesta del backend no es JSON',
          contentType,
          backendResponsePreview: text.slice(0, 500),
        },
        { status: 502 }
      );
    }

    const data = await backendRes.json();

    return NextResponse.json({ message: 'Datos obtenidos', data });
  } catch (error) {
    console.error('Error interno:', error);
    return NextResponse.json(
      {
        message: 'Error interno del servidor',
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
