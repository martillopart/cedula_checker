import { NextRequest, NextResponse } from 'next/server';
import { loadCase } from '@/lib/db';
import { generatePDF } from '@/lib/pdf';
import { checkRateLimit, getClientIP } from '@/lib/rateLimit';
import { validateUUID } from '@/lib/validation';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Rate limiting (stricter for PDF generation as it's resource-intensive)
    const clientIP = getClientIP(request);
    const rateLimit = checkRateLimit(clientIP, 50, 15 * 60 * 1000);

    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        {
          status: 429,
          headers: {
            'X-RateLimit-Limit': '50',
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': new Date(rateLimit.resetTime).toISOString(),
          },
        }
      );
    }

    const { id } = await params;

    // Validate UUID format
    const idValidation = validateUUID(id);
    if (!idValidation.valid) {
      return NextResponse.json(
        { error: idValidation.error },
        { status: 400 }
      );
    }

    const caseData = loadCase(id);

    if (!caseData) {
      return NextResponse.json(
        { error: 'Case not found' },
        { status: 404 }
      );
    }

    // Generate PDF
    const pdfBuffer = generatePDF(caseData);

    // Sanitize filename to prevent path traversal
    const sanitizedId = id.replace(/[^a-zA-Z0-9-]/g, '');

    // Return PDF
    return new NextResponse(Buffer.from(pdfBuffer), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="cedula-report-${sanitizedId}.pdf"`,
        'X-RateLimit-Limit': '50',
        'X-RateLimit-Remaining': rateLimit.remaining.toString(),
        'X-RateLimit-Reset': new Date(rateLimit.resetTime).toISOString(),
      },
    });
  } catch (error) {
    console.error('Error generating PDF:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
