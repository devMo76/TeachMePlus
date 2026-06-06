import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  // TODO: Implement Supabase auth callback.
  return NextResponse.redirect(new URL('/', request.url))
}
