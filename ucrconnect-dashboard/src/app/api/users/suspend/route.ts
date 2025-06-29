import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    // Get the access token from cookies
    const accessToken = request.cookies.get('access_token')?.value;

    if (!accessToken) {
      return NextResponse.json(
        { message: 'Unauthorized', details: 'Access token not found' },
        { status: 401 }
      );
    }

    // Parse the request body
    const body = await request.json();
    const { user_id, days, description } = body;

    // Validate required fields
    if (!user_id || !days) {
      return NextResponse.json(
        { 
          message: 'Validation error', 
          details: 'user_id and days are required fields' 
        },
        { status: 400 }
      );
    }

    // Validate days is a positive integer and only allows 1, 3, or 7
    if (!Number.isInteger(days) || ![1, 3, 7].includes(days)) {
      return NextResponse.json(
        { 
          message: 'Validation error', 
          details: 'days must be 1, 3, or 7' 
        },
        { status: 400 }
      );
    }

    // Validate description length if provided
    if (description && description.length > 500) {
      return NextResponse.json(
        { 
          message: 'Validation error', 
          details: 'description must not exceed 500 characters' 
        },
        { status: 400 }
      );
    }

    // Prepare request body for backend
    const requestBody: any = {
      user_id,
      days
    };

    // Add description only if provided
    if (description) {
      requestBody.description = description;
    }

    // Make request to backend API
    const backendUrl = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/user/suspend`;
    
    console.log('Making request to backend:', backendUrl);
    console.log('Request body:', JSON.stringify(requestBody, null, 2));

    const backendResponse = await fetch(backendUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify(requestBody),
    });

    console.log('Backend response status:', backendResponse.status);
    console.log('Backend response headers:', Object.fromEntries(backendResponse.headers.entries()));

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
    return NextResponse.json(backendData, { status: 201 });

  } catch (error) {
    console.error('Error suspending user:', error);
    return NextResponse.json(
      {
        message: 'Internal server error',
        error: error instanceof Error ? error.message : 'Unknown error',
        details: 'An unexpected error occurred while suspending the user'
      },
      { status: 500 }
    );
  }
} 