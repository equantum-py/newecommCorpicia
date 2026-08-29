import { NextResponse } from 'next/server';
import { getHomeHeroSettings } from '@/lib/repositories/home-hero.server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const settings = await getHomeHeroSettings();
  return NextResponse.json(settings, { headers: { 'Cache-Control': 'no-store' } });
}
