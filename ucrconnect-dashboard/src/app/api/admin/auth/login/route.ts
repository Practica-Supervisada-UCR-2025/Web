import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log('Request body:', body);
    
    if (!process.env.NEXT_PUBLIC_API_URL) {
      console.error('NEXT_PUBLIC_API_URL is not set');
      return NextResponse.json(
        { message: 'Backend URL not configured' },
        { status: 500 }
      );
    }

    const backendUrl = `${process.env.NEXT_PUBLIC_API_URL}/admin/auth/login`;
    console.log('Making request to:', backendUrl);
    
    try {
      const response = await fetch(backendUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        let errorData;
        try {
          errorData = await response.json();
        } catch (e) {
          errorData = { message: 'Failed to parse error response' };
        }
        
        console.error('Backend error response:', {
          status: response.status,
          statusText: response.statusText,
          data: errorData
        });

        return NextResponse.json(
          { 
            message: errorData.message || 'Authentication failed', 
            details: errorData.details,
            status: response.status
          },
          { status: response.status }
        );
      }

      const { access_token } = await response.json();
      
      const successResponse = NextResponse.json({ message: 'Login successful' });
      
      // Set the access token as an HTTP-only cookie
      successResponse.cookies.set('access_token', access_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/',
        maxAge: 60 * 60 * 24 // 24 hours
      });

      return successResponse;
    } catch (fetchError) {
      console.error('Failed to connect to backend:', fetchError);
      return NextResponse.json(
        { 
          message: 'Failed to connect to backend server',
          details: 'Please check if the backend server is running and accessible',
          error: fetchError instanceof Error ? fetchError.message : 'Unknown connection error'
        },
        { status: 503 }
      );
    }
  } catch (error) {
    console.error('Error in login route:', error);
    return NextResponse.json(
      { 
        message: 'Internal server error', 
        error: error instanceof Error ? error.message : 'Unknown error',
        details: 'An unexpected error occurred while processing your request'
      },
      { status: 500 }
    );
  }
} 