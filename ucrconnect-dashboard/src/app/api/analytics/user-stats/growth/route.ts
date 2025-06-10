// // app/api/analytics/user-stats/growth/route.ts
// import { NextRequest, NextResponse } from 'next/server';

// export async function GET(req: NextRequest) {
//   const accessToken = req.cookies.get('access_token')?.value;

//   if (!accessToken) {
//     return NextResponse.json(
//       { message: 'No autorizado: token no presente' },
//       { status: 401 }
//     );
//   }

//   const { searchParams } = new URL(req.url);
//   const interval = searchParams.get('interval');
//   const startDate = searchParams.get('startDate');
//   const endDate = searchParams.get('endDate');

//   if (!interval || !startDate || !endDate) {
//     return NextResponse.json(
//       { message: 'Faltan parámetros requeridos' },
//       { status: 400 }
//     );
//   }

//   let data;

//   switch (interval) {
//     case 'daily':
//       data = {
//         series: [
//           { date: '2023-05-01', count: 12 },
//           { date: '2023-05-02', count: 8 },
//           { date: '2023-05-03', count: 15 },
//           { date: '2023-05-04', count: 7 },
//           { date: '2023-05-05', count: 10 },
//         ],
//         totalUsers: 1250,
//         totalActiveUsers: 980,
//         aggregatedByInterval: 'daily',
//       };
//       break;

//     case 'weekly':
//       data = {
//         series: [
//           { date: '2023-W18', count: 45 }, // Week 18 (1-7 May)
//           { date: '2023-W19', count: 62 }, // Week 19 (8-14 May)
//           { date: '2023-W20', count: 58 }, // Week 20 (15-21 May)
//           { date: '2023-W21', count: 37 }, // Week 21 (22-28 May)
//         ],
//         totalUsers: 1250,
//         totalActiveUsers: 980,
//         aggregatedByInterval: 'weekly',
//       };
//       break;

//     case 'monthly':
//       data = {
//         series: [
//           { date: '2023-01', count: 120 },
//           { date: '2023-02', count: 145 },
//           { date: '2023-03', count: 168 },
//           { date: '2023-04', count: 190 },
//           { date: '2023-05', count: 215 },
//           { date: '2023-06', count: 197 },
//         ],
//         totalUsers: 1250,
//         totalActiveUsers: 980,
//         aggregatedByInterval: 'monthly',
//       };
//       break;

//     default:
//       return NextResponse.json(
//         { message: `Intervalo no soportado: ${interval}` },
//         { status: 400 }
//       );
//   }

//   return NextResponse.json({
//     message: 'User growth statistics retrieved successfully',
//     data,
//   });
// }


// app/api/analytics/user-stats/growth/route.ts
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

  // Validación simple de parámetros
  if (!interval || !startDate || !endDate) {
    return NextResponse.json(
      { message: 'Faltan parámetros requeridos: interval, startDate, endDate' },
      { status: 400 }
    );
  }

  const backendUrl = `${process.env.NEXT_PUBLIC_ANALYTICS_URL}/api/analytics/users-stats/growth?interval=${interval}&startDate=${startDate}&endDate=${endDate}`;

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
