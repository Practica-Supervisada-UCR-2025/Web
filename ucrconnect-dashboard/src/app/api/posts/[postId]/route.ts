import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET(
    request: NextRequest,
    { params }: { params: { postId: string } }
) {
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

        // Await params before using its properties
        const { postId } = await params;

        if (!postId) {
            return NextResponse.json(
                { message: 'Bad Request', details: 'Post ID is required' },
                { status: 400 }
            );
        }

        // Parse query parameters from the URL for comment pagination
        const { searchParams } = new URL(request.url);

        // Build query string with optional comment pagination parameters
        const queryParams = new URLSearchParams();

        // Optional comment pagination parameters
        const commentPage = searchParams.get('commentPage');
        const commentLimit = searchParams.get('commentLimit');

        if (commentPage) {
            queryParams.append('commentPage', commentPage);
        }
        if (commentLimit) {
            queryParams.append('commentLimit', commentLimit);
        }

        // Build the backend URL
        const queryString = queryParams.toString();
        const backendUrl = `${process.env.NEXT_PUBLIC_POST_URL}/api/user/posts/${postId}${queryString ? `?${queryString}` : ''}`;

        // Make request to backend API
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
        console.error('Error fetching post by ID:', error);
        return NextResponse.json(
            {
                message: 'Internal server error',
                error: error instanceof Error ? error.message : 'Unknown error',
                details: 'An unexpected error occurred while fetching the post'
            },
            { status: 500 }
        );
    }
}