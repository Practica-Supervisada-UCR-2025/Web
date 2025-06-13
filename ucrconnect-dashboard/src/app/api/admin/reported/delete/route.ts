import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
    try {
        // Get the access token from cookies
        const cookieStore = await cookies();
        const accessToken = request.cookies.get('access_token')?.value;

        if (!accessToken) {
            return NextResponse.json(
                {
                    success: false,
                    message: 'Access denied: You do not have permission to perform this action'
                },
                { status: 403 }
            );
        }

        // Parse request body
        const body = await request.json();
        const { postId, authorUsername, moderatorUsername } = body;

        // Validate required fields
        if (!postId) {
            return NextResponse.json(
                {
                    success: false,
                    message: 'Validation error'
                },
                { status: 400 }
            );
        }

        if (!authorUsername) {
            return NextResponse.json(
                {
                    success: false,
                    message: 'Validation error'
                },
                { status: 400 }
            );
        }

        if (!moderatorUsername) {
            return NextResponse.json(
                {
                    success: false,
                    message: 'Validation error'
                },
                { status: 400 }
            );
        }

        // Make request to backend API
        const backendUrl = `${process.env.NEXT_PUBLIC_POST_URL}/api/admin/reported/delete`;

        const backendResponse = await fetch(backendUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}`,
            },
            body: JSON.stringify({
                postId,
                authorUsername,
                moderatorUsername
            })
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
                        success: false,
                        message: 'mensaje de error del servicio'
                    },
                    { status: 500 }
                );
            }
            backendData = { success: true, message: 'Post and its reports have been successfully deactivated' };
        }

        // Handle different response status codes
        if (backendResponse.status === 200) {
            return NextResponse.json(
                {
                    success: true,
                    message: 'Post and its reports have been successfully deactivated'
                },
                { status: 200 }
            );
        } else if (backendResponse.status === 400) {
            return NextResponse.json(
                {
                    success: false,
                    message: 'Validation error'
                },
                { status: 400 }
            );
        } else if (backendResponse.status === 403) {
            return NextResponse.json(
                {
                    success: false,
                    message: 'Access denied: You do not have permission to perform this action'
                },
                { status: 403 }
            );
        } else if (backendResponse.status === 500) {
            return NextResponse.json(
                {
                    success: false,
                    message: 'mensaje de error del servicio'
                },
                { status: 500 }
            );
        }

        // Return backend response as-is for other cases
        return NextResponse.json(backendData, { status: backendResponse.status });

    } catch (error) {
        console.error('Error deleting reported post:', error);
        return NextResponse.json(
            {
                success: false,
                message: 'mensaje de error del servicio'
            },
            { status: 500 }
        );
    }
}