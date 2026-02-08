import { NextRequest, NextResponse } from 'next/server';
import { loadCaseByShareId } from '@/lib/db';
import { checkRateLimit, getClientIP } from '@/lib/rateLimit';
import { validateShareId } from '@/lib/validation';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ shareId: string }> }
) {
  try {
    // Rate limiting
    const clientIP = getClientIP(request);
    const rateLimit = checkRateLimit(clientIP, 200, 15 * 60 * 1000);

    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        {
          status: 429,
          headers: {
            'X-RateLimit-Limit': '200',
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': new Date(rateLimit.resetTime).toISOString(),
          },
        }
      );
    }

    const { shareId } = await params;

    // Validate share ID format
    const shareIdValidation = validateShareId(shareId);
    if (!shareIdValidation.valid) {
      return NextResponse.json(
        { error: shareIdValidation.error },
        { status: 400 }
      );
    }

    const caseData = loadCaseByShareId(shareId);

    if (!caseData) {
      return NextResponse.json(
        { error: 'Case not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(caseData, {
      headers: {
        'X-RateLimit-Limit': '200',
        'X-RateLimit-Remaining': rateLimit.remaining.toString(),
        'X-RateLimit-Reset': new Date(rateLimit.resetTime).toISOString(),
      },
    });
  } catch (error) {
    console.error('Error loading case by share ID:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
