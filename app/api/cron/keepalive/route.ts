import { NextResponse } from 'next/server';
import { getServiceDb } from '@/lib/db';

/**
 * Daily ping from Vercel Cron (see vercel.json). Supabase pauses free-tier
 * projects after about a week without traffic, which breaks sign-in; one
 * cheap query a day keeps it awake. Vercel sends `Authorization: Bearer
 * $CRON_SECRET`; anything else is rejected.
 */
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || request.headers.get('authorization') !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'Unauthorized', code: 'UNAUTHORIZED' }, { status: 401 });
  }

  const { count, error } = await getServiceDb()
    .from('problems')
    .select('id', { count: 'exact', head: true });

  if (error) {
    console.error('keepalive query failed', { error: error.message });
    return NextResponse.json({ error: 'Database unreachable', code: 'INTERNAL_ERROR' }, { status: 503 });
  }
  return NextResponse.json({ data: { ok: true, problems: count ?? 0 } });
}
