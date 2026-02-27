/**
 * Server-side Supabase client.
 * Uses @supabase/ssr's createServerClient with Next.js cookies().
 */

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

/**
 * Creates a Supabase client for use in server components, server actions,
 * and route handlers. Reads/writes auth cookies via Next.js cookies() API.
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch {
            // setAll can fail in Server Components where cookies are read-only.
            // This is safe to ignore when the middleware refreshes the session.
          }
        },
      },
    }
  );
}
