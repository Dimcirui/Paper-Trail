import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { SignJWT } from 'jose';

function getJwtSecretKey() {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET environment variable is not set');
  }
  return new TextEncoder().encode(secret);
}

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

        const userRole = user.role.roleName.toLowerCase().replace(/\s/g, '_');

        // 4. Successful authentication
        const token = await new SignJWT({ userId: user.id, role: userRole })
            .setProtectedHeader({ alg: 'HS256' })
            .setIssuedAt()
            .setExpirationTime('24h')
            .sign(getJwtSecretKey());

        const responsePayload = {
            id: user.id,
            userName: user.userName,
            email: user.email,
            role: user.role.roleName.toLowerCase().replace(/\s+/g, '_'),
        };

        const response = NextResponse.json({ token, user: responsePayload }, { status: 200 });

        response.cookies.set({
            name: 'auth_token',
            value: token,
            httpOnly: true, // Prevent client-side JS access
            secure: process.env.NODE_ENV === 'production', // Use https in production
            sameSite: 'strict',
            maxAge: 24 * 60 * 60, // 1 day
            path: '/',
        });

        return response;
    } catch (error) {
        console.error('Login error:', error);
        return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
    }
}