// app/api/admin/auth/profile/route.ts
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get('access_token')?.value

    if (!token) {
      return NextResponse.json(
        { message: 'Unauthorized', error: 'No access token found in cookies' },
        { status: 401 }
      )
    }

    const backendRes = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/admin/auth/profile`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    const backendData = await backendRes.json()

    if (!backendRes.ok) {
      return NextResponse.json(
        { message: 'Failed to fetch profile', error: backendData },
        { status: backendRes.status }
      )
    }

    return NextResponse.json({
      message: 'Profile retrieved successfully',
      data: backendData.data,
    })
  } catch (error) {
    console.error('Error in profile route:', error)
    return NextResponse.json(
      {
        message: 'Internal server error',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const token = req.cookies.get('access_token')?.value
    if (!token) {
      return NextResponse.json(
        { message: 'Unauthorized', error: 'No access token found in cookies' },
        { status: 401 }
      )
    }

    const formData = await req.formData()

    const full_name = formData.get('full_name')
    const profile_picture = formData.get('profile_picture')

    const forwardFormData = new FormData()
    if (typeof full_name === 'string') {
      forwardFormData.append('full_name', full_name)
    }
    if (profile_picture instanceof File) {
      forwardFormData.append('profile_picture', profile_picture)
    }

    const backendRes = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/admin/auth/profile`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: forwardFormData,
    })

    const backendData = await backendRes.json()

    if (!backendRes.ok) {
      return NextResponse.json(
        { message: 'Failed to update profile', error: backendData },
        { status: backendRes.status }
      )
    }

    return NextResponse.json({
      message: 'Profile updated successfully',
      data: backendData.data,
    })
  } catch (error) {
    console.error('Error in profile PATCH route:', error)
    return NextResponse.json(
      {
        message: 'Internal server error',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}