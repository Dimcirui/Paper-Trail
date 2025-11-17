import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
    let payload;
    try {
        payload = await request.json();
    } catch {
        return NextResponse.json({ error: 'Invalid JSON format.' }, { status: 400 });
    }

    const { email, password } = payload;

    if (!email || !password) {
        return NextResponse.json({ error: 'Email and password are required.' }, { status: 400 });
    }

    try {
        // 1. Search for user by email
        const user = await prisma.user.findUnique({
            where: { email },
            include: { role: true },
        });

        // 2. User not found
        if (!user) {
            return NextResponse.json({ error: 'User not found.' }, { status: 404 });
        }

        // 3. Verify password (Should use hashed passwords in production)
        const isPasswordValid = user.password === password; // Simplified for demo purposes
        if (!isPasswordValid) {
            return NextResponse.json({ error: 'Invalid password.' }, { status: 401 });
        }

        // 4. Successful authentication
        const responsePayload = {
            id: user.id,
            userName: user.userName,
            email: user.email,
            role: user.role.roleName.toLowerCase().replace(/\s+/g, '_'),
        };

        return NextResponse.json({ success: true, user: responsePayload }, { status: 200 });
    } catch (error) {
        console.error('Login error:', error);
        return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
    }
}