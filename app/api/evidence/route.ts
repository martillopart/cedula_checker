import { NextRequest, NextResponse } from 'next/server';
import { writeFile, unlink } from 'fs/promises';
import path from 'path';
import { saveEvidence, loadEvidenceByCase } from '@/lib/db-users';
import { getCurrentUser } from '@/lib/auth-helpers';
import { checkRateLimit, getClientIP } from '@/lib/rateLimit';
import { validateUUID, sanitizeStringWithLimit } from '@/lib/validation';
import { loadCase } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const rateLimit = checkRateLimit(getClientIP(request), 200, 15 * 60 * 1000);
    if (!rateLimit.allowed) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }

    const { searchParams } = new URL(request.url);
    const caseId = searchParams.get('caseId');

    if (!caseId) {
      return NextResponse.json({ error: 'caseId is required' }, { status: 400 });
    }

    const idValidation = validateUUID(caseId);
    if (!idValidation.valid) {
      return NextResponse.json({ error: idValidation.error }, { status: 400 });
    }

    const user = await getCurrentUser();
    const caseData = loadCase(caseId);

    if (!caseData) {
      return NextResponse.json({ error: 'Case not found' }, { status: 404 });
    }

    // Check access
    if (user && caseData.userId && caseData.userId !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const evidence = loadEvidenceByCase(caseId);
    return NextResponse.json(evidence);
  } catch (error) {
    console.error('Error loading evidence:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const rateLimit = checkRateLimit(getClientIP(request), 20, 15 * 60 * 1000);
    if (!rateLimit.allowed) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }

    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const caseId = formData.get('caseId') as string | null;
    const file = formData.get('file') as File | null;
    const description = formData.get('description') as string | null;
    const type = formData.get('type') as 'photo' | 'document' | null;

    if (!caseId || !file) {
      return NextResponse.json(
        { error: 'caseId and file are required' },
        { status: 400 }
      );
    }

    // Additional safety checks for file properties
    if (!file.name || typeof file.name !== 'string') {
      return NextResponse.json(
        { error: 'File name is required' },
        { status: 400 }
      );
    }

    if (!file.type || typeof file.type !== 'string') {
      return NextResponse.json(
        { error: 'File type is required' },
        { status: 400 }
      );
    }

    if (typeof file.size !== 'number' || file.size < 0) {
      return NextResponse.json(
        { error: 'Invalid file size' },
        { status: 400 }
      );
    }

    const idValidation = validateUUID(caseId);
    if (!idValidation.valid) {
      return NextResponse.json({ error: idValidation.error }, { status: 400 });
    }

    // Verify case access
    const caseData = loadCase(caseId);
    if (!caseData) {
      return NextResponse.json({ error: 'Case not found' }, { status: 404 });
    }

    if (caseData.userId && caseData.userId !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Validate file
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return NextResponse.json({ error: 'File too large (max 10MB)' }, { status: 400 });
    }

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: 'Invalid file type' }, { status: 400 });
    }

    // Sanitize filename to prevent path traversal and other security issues
    const sanitizedOriginalName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_').substring(0, 100);
    const lastDotIndex = sanitizedOriginalName.lastIndexOf('.');
    const fileExtension = lastDotIndex > 0 && lastDotIndex < sanitizedOriginalName.length - 1
      ? sanitizedOriginalName.substring(lastDotIndex)
      : '';
    const baseName = lastDotIndex > 0 
      ? sanitizedOriginalName.substring(0, lastDotIndex).replace(/\./g, '_')
      : sanitizedOriginalName.replace(/\./g, '_');
    const safeFilename = `${Date.now()}-${baseName}${fileExtension}`;
    
    // Save file
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const filename = safeFilename;
    const filepath = path.join(process.cwd(), 'data', 'evidence', filename);
    
    // Additional security: ensure path is within evidence directory (prevent path traversal)
    const resolvedPath = path.resolve(filepath);
    const evidenceDirPath = path.resolve(path.join(process.cwd(), 'data', 'evidence'));
    if (!resolvedPath.startsWith(evidenceDirPath)) {
      return NextResponse.json({ error: 'Invalid file path' }, { status: 400 });
    }

    await writeFile(filepath, buffer);

    // Determine type
    const evidenceType = type || (file.type.startsWith('image/') ? 'photo' : 'document');

    // Save evidence record
    // If this fails, we need to clean up the file we just wrote
    let evidence;
    try {
      evidence = saveEvidence({
        caseId,
        type: evidenceType,
        filename,
        originalFilename: sanitizeStringWithLimit(file.name, 255),
        mimeType: file.type,
        size: file.size,
        url: filename,
        uploadedBy: user.id,
        description: description ? sanitizeStringWithLimit(description, 500) : undefined,
      });
    } catch (saveError) {
      // Clean up the file if database save fails
      try {
        await unlink(filepath);
      } catch (unlinkError) {
        // File might not exist or already deleted, log but continue
        console.error('Error cleaning up file after save failure:', unlinkError);
      }
      throw saveError; // Re-throw to be caught by outer catch
    }

    return NextResponse.json(evidence, { status: 201 });
  } catch (error) {
    console.error('Error uploading evidence:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
