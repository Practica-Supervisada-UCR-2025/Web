import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET(
    request: NextRequest,
    context: { params: { postId: string } }
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

        // Get postId from params - properly await the params
        const params = await context.params;
        const { postId } = params;
        if (!postId) {
            return NextResponse.json(
                { message: 'Bad Request', details: 'Post ID is required' },
                { status: 400 }
            );
        }

        // Get page parameter from URL search params
        const searchParams = request.nextUrl.searchParams;
        const page = searchParams.get('page') || '1';
        const pageSize = searchParams.get('pageSize') || '5';

        // Make request to backend API with pagination parameters
        const backendUrl = `${process.env.NEXT_PUBLIC_POST_URL}/api/user/posts/${postId}?page=${page}&pageSize=${pageSize}`;

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
            
            // Ensure we have pagination metadata
            if (backendData.post && backendData.post.comments) {
                
                // If we don't have metadata, create it
                if (!backendData.post.comments_metadata) {
                    backendData.post.comments_metadata = {
                        currentPage: parseInt(page),
                        totalPages: Math.ceil(backendData.post.comments_metadata?.totalItems / parseInt(pageSize)),
                        totalItems: backendData.post.comments_metadata?.totalItems || backendData.post.comments.length
                    };
                } else {
                    // Ensure the current page is set correctly
                    backendData.post.comments_metadata.currentPage = parseInt(page);
                }
                
                // If we're requesting page 2 or higher but getting the same comments as page 1,
                // we need to handle this case
                if (parseInt(page) > 1 && backendData.post.comments.length === parseInt(pageSize)) {
                    // Check if these are the same comments as page 1
                    const firstCommentId = backendData.post.comments[0]?.id;
                    if (firstCommentId) {
                        console.log('Warning: Backend might be returning the same comments for different pages');
                        // You might want to add a warning or handle this case differently
                    }
                }
            }
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
                details: 'An unexpected error occurred while fetching post'
            },
            { status: 500 }
        );
    }
}