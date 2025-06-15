import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export interface Comment {
  id: string;
  user_id: string;
  username: string;
  email: string;
  content: string;
  created_at: string;
  updated_at: string;
}

export interface CommentResponse {
  comments: Comment[];
  total_comments: number;
  has_more: boolean;
} 

export async function GET(
    request: NextRequest
) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get('access_token')?.value;

        if (!token) {
            return NextResponse.json(
                { message: 'No se pudo obtener el token' },
                { status: 401 }
            );
        }

        const postId = request.nextUrl.pathname.split('/').pop();
        if (!postId) {
            return NextResponse.json(
                { message: 'ID de publicación no proporcionado' },
                { status: 400 }
            );
        }

        const searchParams = request.nextUrl.searchParams;
        const index = searchParams.get('index') || '0';
        const startTime = searchParams.get('start_time');

        const queryParams = new URLSearchParams();
        queryParams.append('index', index);
        if (startTime) {
            queryParams.append('start_time', startTime);
        }

        const response = await fetch(
            `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/admin/content/${postId}/comments?${queryParams.toString()}`,
            {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            }
        );

        if (!response.ok) {
            const errorData = await response.json();
            return NextResponse.json(
                { message: errorData.message || 'Error al obtener los comentarios' },
                { status: response.status }
            );
        }

        const data: CommentResponse = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error('Error fetching comments:', error);
        return NextResponse.json(
            { 
                message: 'Error interno del servidor',
                error: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        );
    }
} 