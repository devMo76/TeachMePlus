// USE THIS FILE in src/middleware.ts only.
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  // TODO: Implement full session refresh and route protection.
  return NextResponse.next({ request })
}
