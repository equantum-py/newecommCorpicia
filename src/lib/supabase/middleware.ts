import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function updateSession(request: NextRequest) {
  try {
    const pathname = request.nextUrl.pathname;

    if (
      pathname === '/admin/login' ||
      pathname === '/admin/login/' ||
      pathname === '/admin/reset-password' ||
      pathname === '/admin/reset-password/' ||
      pathname.startsWith('/admin/auth')
    ) {
      return NextResponse.next();
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      console.warn('[Middleware] Missing Supabase environment variables');
      return NextResponse.next();
    }

    let supabaseResponse = NextResponse.next({
      request: {
        headers: request.headers,
      },
    });

    const supabase = createServerClient(
      supabaseUrl,
      supabaseAnonKey,
      {
        cookies: {
          get(name: string) {
            return request.cookies.get(name)?.value;
          },
          set(name: string, value: string, options: CookieOptions) {
            request.cookies.set({ name, value, ...options });
            supabaseResponse = NextResponse.next({
              request: { headers: request.headers },
            });
            supabaseResponse.cookies.set({ name, value, ...options });
          },
          remove(name: string, options: CookieOptions) {
            request.cookies.set({ name, value: '', ...options });
            supabaseResponse = NextResponse.next({
              request: { headers: request.headers },
            });
            supabaseResponse.cookies.set({ name, value: '', ...options });
          },
        },
      }
    );

    const {
      data: { user },
    } = await supabase.auth.getUser();

    const isAdminRoute = pathname.startsWith('/admin');

    if (!user && isAdminRoute) {
      const url = request.nextUrl.clone();
      url.pathname = '/admin/login';
      return NextResponse.redirect(url);
    }

    if (user && isAdminRoute) {
      const { data: profile } = await supabase
        .from('admin_profiles')
        .select('role, is_active')
        .eq('user_id', user.id)
        .single();

      if (!profile || !profile.is_active) {
        await supabase.auth.signOut();
        const url = request.nextUrl.clone();
        url.pathname = '/admin/login';
        url.searchParams.set('error', 'unauthorized');
        return NextResponse.redirect(url);
      }
    }

    return supabaseResponse;
  } catch (error) {
    console.error('[Middleware] Unexpected error:', error);
    return NextResponse.next();
  }
}
