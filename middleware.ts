import { NextResponse } from 'next/server';

/**
 * The screenshot harness at /dev-preview exists only in development. The
 * page itself calls notFound(), but the layout has already streamed a 200
 * status by then, so the real 404 is issued here, before rendering starts.
 */
export function middleware() {
  if (process.env.NODE_ENV === 'production') {
    return new NextResponse('Not found', { status: 404 });
  }
  return NextResponse.next();
}

export const config = { matcher: '/dev-preview' };
