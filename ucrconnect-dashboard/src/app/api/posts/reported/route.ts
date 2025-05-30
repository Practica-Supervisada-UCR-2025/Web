import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
    try {
        // Get the access token from cookies
        const cookieStore = await cookies();
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

        // Required parameters
        const page = searchParams.get('page') || '1';
        const limit = searchParams.get('limit') || '8';

        queryParams.append('page', page);
        queryParams.append('limit', limit);

        // Optional parameters
        const username = searchParams.get('username');
        const orderBy = searchParams.get('orderBy');
        const orderDirection = searchParams.get('orderDirection');

        if (username) {
            queryParams.append('username', username);
        }

        if (orderBy) {
            queryParams.append('orderBy', orderBy);
        }

        if (orderDirection) {
            queryParams.append('orderDirection', orderDirection);
        }

        // Make request to backend API
        const backendUrl = `${process.env.NEXT_PUBLIC_POST_URL}/api/posts/reported?${queryParams.toString()}`;

        const backendResponse = await fetch(backendUrl, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}`,
            },
        });

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
        console.error('Error fetching reported posts:', error);
        return NextResponse.json(
            {
                message: 'Internal server error',
                error: error instanceof Error ? error.message : 'Unknown error',
                details: 'An unexpected error occurred while fetching reported posts'
            },
            { status: 500 }
        );
    }
}