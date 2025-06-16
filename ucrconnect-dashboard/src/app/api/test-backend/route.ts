import { NextResponse } from 'next/server';

export async function GET() {
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/system/health`);
        const text = await response.text();

        return NextResponse.json({
            status: response.status,
            headers: Object.fromEntries(response.headers.entries()),
            body: text.substring(0, 1000),
            url: `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/system/health`
        });
    } catch (error) {
        // Properly handle the unknown error type
        return NextResponse.json({
            error: error instanceof Error ? error.message : 'An unknown error occurred'
        });
    }
}