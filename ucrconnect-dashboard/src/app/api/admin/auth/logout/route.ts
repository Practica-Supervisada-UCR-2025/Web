import { NextResponse } from 'next/server';
import { getDbClient } from '@/lib/db';
import { cookies } from 'next/headers';

export async function POST() {
    try {
        const client = await getDbClient();
        const cookieStore = await cookies();
        const access_token = cookieStore.get('access_token')?.value;

        if (access_token) {
            // Delete the session from the database
            await client.query(
                'DELETE FROM sessions WHERE token = $1',
                [access_token]
            );
        }

        // Create a response
        const response = NextResponse.json({ message: 'Logged out successfully' });
        
        // Clear the access token cookie
        response.cookies.set('access_token', '', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
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