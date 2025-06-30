import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Get the access token from cookies
    const accessToken = request.cookies.get('access_token')?.value;

    if (!accessToken) {
      return NextResponse.json(
        { message: 'Unauthorized', details: 'Access token not found' },
        { status: 401 }
      );
    }

    // Parse query parameters from the URL
    const { searchParams } = new URL(request.url);

    // Build query string with provided parameters
    const queryParams = new URLSearchParams();

    // Optional parameters
    const username = searchParams.get('username');
    const createdAfter = searchParams.get('created_after');
    const limit = searchParams.get('limit');

    if (username) {
      // If username is provided, use it and ignore pagination
      queryParams.append('username', username);
    } else if (createdAfter && limit) {
      // If pagination parameters are provided, use them
      queryParams.append('created_after', createdAfter);
      queryParams.append('limit', limit);
    } else {
      // If no parameters provided, return 400 as per API spec
      return NextResponse.json(
        { message: 'Bad Request', details: 'Either username or both created_after and limit must be provided' },
        { status: 400 }
      );
    }

    // Make request to backend API
    const backendUrl = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/users/get/all?${queryParams.toString()}`;
    
    const backendResponse = await fetch(backendUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    console.log('Backend response status:', backendResponse.status);

    // Handle non-JSON responses
    const contentType = backendResponse.headers.get('content-type');
    let backendData;

    if (contentType && contentType.includes('application/json')) {
      backendData = await backendResponse.json();
    
    } else {
      const textResponse = await backendResponse.text();
      console.error('Backend returned non-JSON response:', textResponse);

      if (!backendResponse.ok) {
        return NextResponse.json(
          {
            message: 'Backend error',
            details: `Backend returned ${backendResponse.status}: ${textResponse.substring(0, 200)}`,
            status: backendResponse.status
          },
          { status: backendResponse.status }
        );
      }

      backendData = { message: 'Success', data: textResponse };
    }

    if (!backendResponse.ok) {
      // Pass through the backend's error response
      return NextResponse.json(
        backendData,
        { status: backendResponse.status }
      );
    }

    // Return successful response
    return NextResponse.json(backendData, { status: 200 });

  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      {
        message: 'Internal server error',
        error: error instanceof Error ? error.message : 'Unknown error',
        details: 'An unexpected error occurred while fetching users'
      },
      { status: 500 }
    );
  }
} 