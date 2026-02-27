import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const loginSchema = z.object({
  action: z.literal('login'),
  email: z.string().email(),
  password: z.string().optional(),
});

const signupSchema = z.object({
  action: z.literal('signup'),
  fullName: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
  role: z.enum(['homeowner', 'agent', 'investor', 'appraiser', 'lender']),
  licenseNumber: z.string().optional(),
  licenseState: z.string().optional(),
});

const logoutSchema = z.object({
  action: z.literal('logout'),
});

const authSchema = z.discriminatedUnion('action', [
  loginSchema,
  signupSchema,
  logoutSchema,
]);

/**
 * POST /api/auth
 *
 * Handles authentication operations (login, signup, logout) via Supabase.
 * MVP: Returns mock success responses without actual Supabase integration.
 * Production: Wire up to Supabase Auth.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = authSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const data = parsed.data;

    switch (data.action) {
      case 'login': {
        // MVP: Accept any valid email
        // Production: Use Supabase auth.signInWithPassword or auth.signInWithOtp

        if (data.password) {
          // Password login
          return NextResponse.json({
            user: {
              id: 'mock-user-id',
              email: data.email,
              fullName: 'Demo User',
              role: 'agent',
            },
            session: {
              accessToken: 'mock-access-token',
              refreshToken: 'mock-refresh-token',
              expiresAt: Date.now() + 3600 * 1000,
            },
            message: 'Logged in successfully',
          });
        }

        // Magic link login
        return NextResponse.json({
          message: 'Magic link sent to your email',
          email: data.email,
        });
      }

      case 'signup': {
        // MVP: Accept any valid signup
        // Production: Use Supabase auth.signUp and create user profile

        return NextResponse.json({
          user: {
            id: 'mock-new-user-id',
            email: data.email,
            fullName: data.fullName,
            role: data.role,
            licenseNumber: data.licenseNumber || null,
            licenseState: data.licenseState || null,
          },
          session: {
            accessToken: 'mock-access-token',
            refreshToken: 'mock-refresh-token',
            expiresAt: Date.now() + 3600 * 1000,
          },
          message: 'Account created successfully',
        });
      }

      case 'logout': {
        // MVP: Just return success
        // Production: Use Supabase auth.signOut and clear cookies

        return NextResponse.json({
          message: 'Logged out successfully',
        });
      }

      default:
        return NextResponse.json(
          { error: 'Unknown action' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Auth API error:', error);
    return NextResponse.json(
      { error: 'Authentication failed' },
      { status: 500 }
    );
  }
}
