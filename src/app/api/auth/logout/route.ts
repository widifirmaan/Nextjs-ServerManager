import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST() {
    const cookieStore = await cookies();
    cookieStore.group().delete('auth_token');

    // Explicitly set cookie to expire to ensure removal in all browsers
    const response = NextResponse.json({ success: true });
    response.cookies.delete('auth_token');

    return response;
}
