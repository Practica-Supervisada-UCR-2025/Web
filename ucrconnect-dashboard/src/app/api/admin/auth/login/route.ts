import { NextResponse } from 'next/server';
import { getDbClient } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log('Request body:', body);
    
    const client = await getDbClient();
    
    try {
      // Verify user exists in database (should be created by backend)
      const result = await client.query(
        'SELECT id FROM users WHERE auth_id = $1',
        [body.auth_id]
      );

      if (result.rows.length === 0) {
        return NextResponse.json(
          { 
            message: 'User not found',
            details: 'User must be created in the database first'
          },
          { status: 404 }
        );
      }

      const successResponse = NextResponse.json({ message: 'Login successful' });
      
      // Set the Firebase token as an HTTP-only cookie
      successResponse.cookies.set('access_token', body.auth_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/',
        maxAge: 60 * 60 * 24 // 24 hours
      });

      return successResponse;
    } catch (dbError) {
      console.error('Database error:', dbError);
      return NextResponse.json(
        { 
          message: 'Database error',
          details: 'Failed to process authentication',
          error: dbError instanceof Error ? dbError.message : 'Unknown database error'
        },
        { status: 500 }
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