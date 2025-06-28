import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Validate required fields
    if (!body.auth_id || !body.auth_token || !body.email || !body.full_name) {
      console.error('Missing required fields:', {
        has_auth_id: !!body.auth_id,
        has_auth_token: !!body.auth_token,
        has_email: !!body.email,
        has_full_name: !!body.full_name
      });
      return NextResponse.json(
        { 
          message: 'Invalid request',
          details: 'Missing required fields',
          missing_fields: {
            auth_id: !body.auth_id,
            auth_token: !body.auth_token,
            email: !body.email,
            full_name: !body.full_name
          }
        },
        { status: 400 }
      );
    }

    // Make request to backend API
    const backendResponse = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/admin/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: body.email,
        full_name: body.full_name,
        auth_id: body.auth_id,
        auth_token: body.auth_token
      })
    });

    const backendData = await backendResponse.json();

    if (!backendResponse.ok) {
      // Pass through the backend's error response with additional context
      return NextResponse.json(
        {
          ...backendData,
          frontend_context: 'Login attempt failed',
          timestamp: new Date().toISOString()
        },
        { status: backendResponse.status }
      );
    }

    // Imprime el JWT en consola
    console.log('Received JWT from backend:', backendData.access_token);

    // If backend response is successful, set the cookie and return success
    const successResponse = NextResponse.json({ message: 'Login successful', access_token: backendData.access_token }, { status: 200 });
    
    // Set the access token from backend as HTTP-only cookie
    successResponse.cookies.set('access_token', backendData.access_token, {
      httpOnly: true,
      // secure: process.env.NODE_ENV === 'production',
      secure: false,
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 // 24 hours
    });

    return successResponse;
  } catch (error) {
    console.error('Error in login route:', error);
    return NextResponse.json(
      { 
        message: 'Internal server error', 
        error: error instanceof Error ? error.message : 'Unknown error',
        details: 'An unexpected error occurred while processing your request',
        stack: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    );
  }
} 
