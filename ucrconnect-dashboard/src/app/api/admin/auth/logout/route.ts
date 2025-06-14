import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST() {
    try {
        // Create a response
        const response = NextResponse.json({ message: 'Logged out successfully' });
        
        // Clear the access token cookie
        response.cookies.set('access_token', '', {
            httpOnly: true,
            secure: false,
            sameSite: 'lax',
            path: '/',
            maxAge: 0 // Expire immediately
        });

        return response;
    } catch (error) {
        console.error('Error in logout route:', error);
        return NextResponse.json(
            { message: 'Internal server error' },
            { status: 500 }
        );
    }
} 