import { NextResponse } from 'next/server'
export async function GET() {
  return NextResponse.json({
    has_google: !!process.env.GOOGLE_PLACES_KEY,
    key_prefix: process.env.GOOGLE_PLACES_KEY?.slice(0, 8) ?? 'MISSING',
  })
}
