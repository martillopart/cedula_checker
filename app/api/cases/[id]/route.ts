import { NextRequest, NextResponse } from 'next/server';
import { loadCase, updateCase } from '@/lib/db';
import { checkRateLimit, getClientIP } from '@/lib/rateLimit';
import { validateUUID, sanitizeStringWithLimit } from '@/lib/validation';
import { getCurrentUser } from '@/lib/auth-helpers';
import { CaseStatus, Case } from '@/types';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
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

    // Check if user has access (optional - for backward compatibility)
    try {
      const user = await getCurrentUser();
      if (user && caseData.userId && caseData.userId !== user.id) {
        return NextResponse.json(
          { error: 'Forbidden' },
          { status: 403 }
        );
      }
    } catch (error) {
      // Not authenticated, allow access for backward compatibility
    }

    return NextResponse.json(caseData, {
      headers: {
        'X-RateLimit-Limit': '200',
        'X-RateLimit-Remaining': rateLimit.remaining.toString(),
        'X-RateLimit-Reset': new Date(rateLimit.resetTime).toISOString(),
      },
    });
  } catch (error) {
    console.error('Error loading case:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Rate limiting
    const clientIP = getClientIP(request);
    const rateLimit = checkRateLimit(clientIP, 100, 15 * 60 * 1000);

    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        {
          status: 429,
          headers: {
            'X-RateLimit-Limit': '100',
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

    // Require authentication for updates
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const caseData = loadCase(id);
    if (!caseData) {
      return NextResponse.json(
        { error: 'Case not found' },
        { status: 404 }
      );
    }

    // Check ownership
    if (caseData.userId && caseData.userId !== user.id) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }

    // Parse update data
    let body;
    try {
      body = await request.json();
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid JSON in request body' },
        { status: 400 }
      );
    }

    // Validate status if provided
    if (body.status) {
      const validStatuses: CaseStatus[] = ['new', 'waiting', 'scheduled', 'ready', 'submitted', 'done'];
      if (!validStatuses.includes(body.status)) {
        return NextResponse.json(
          { error: 'Invalid status' },
          { status: 400 }
        );
      }
    }

    // Validate and sanitize optional fields
    const updates: Partial<Case> = {};

    if (body.status) {
      updates.status = body.status;
    }

    if (body.assignedTo !== undefined) {
      if (body.assignedTo !== null && typeof body.assignedTo !== 'string') {
        return NextResponse.json(
          { error: 'assignedTo must be a string or null' },
          { status: 400 }
        );
      }
      // Validate UUID format if provided
      if (body.assignedTo) {
        const idValidation = validateUUID(body.assignedTo);
        if (!idValidation.valid) {
          return NextResponse.json(
            { error: `assignedTo: ${idValidation.error}` },
            { status: 400 }
          );
        }
      }
      updates.assignedTo = body.assignedTo || undefined;
    }

    if (body.scheduledDate !== undefined) {
      if (body.scheduledDate !== null) {
        const date = new Date(body.scheduledDate);
        if (isNaN(date.getTime())) {
          return NextResponse.json(
            { error: 'scheduledDate must be a valid ISO date string' },
            { status: 400 }
          );
        }
        updates.scheduledDate = date.toISOString();
      } else {
        updates.scheduledDate = undefined;
      }
    }

    if (body.submittedDate !== undefined) {
      if (body.submittedDate !== null) {
        const date = new Date(body.submittedDate);
        if (isNaN(date.getTime())) {
          return NextResponse.json(
            { error: 'submittedDate must be a valid ISO date string' },
            { status: 400 }
          );
        }
        updates.submittedDate = date.toISOString();
      } else {
        updates.submittedDate = undefined;
      }
    }

    if (body.completedDate !== undefined) {
      if (body.completedDate !== null) {
        const date = new Date(body.completedDate);
        if (isNaN(date.getTime())) {
          return NextResponse.json(
            { error: 'completedDate must be a valid ISO date string' },
            { status: 400 }
          );
        }
        updates.completedDate = date.toISOString();
      } else {
        updates.completedDate = undefined;
      }
    }

    if (body.notes !== undefined) {
      if (body.notes !== null && typeof body.notes !== 'string') {
        return NextResponse.json(
          { error: 'notes must be a string or null' },
          { status: 400 }
        );
      }
      if (body.notes && body.notes.length > 2000) {
        return NextResponse.json(
          { error: 'notes must be less than 2000 characters' },
          { status: 400 }
        );
      }
      updates.notes = body.notes ? sanitizeStringWithLimit(body.notes, 2000) : undefined;
    }

    if (body.tags !== undefined) {
      if (!Array.isArray(body.tags)) {
        return NextResponse.json(
          { error: 'tags must be an array' },
          { status: 400 }
        );
      }
      if (body.tags.length > 20) {
        return NextResponse.json(
          { error: 'tags array cannot have more than 20 items' },
          { status: 400 }
        );
      }
      updates.tags = body.tags
        .filter((tag: any) => typeof tag === 'string')
        .map((tag: string) => sanitizeStringWithLimit(tag, 50))
        .filter((tag: string) => tag.length > 0)
        .slice(0, 20);
    }

    if (body.teamId !== undefined) {
      if (body.teamId !== null) {
        if (typeof body.teamId !== 'string' || body.teamId.trim().length === 0) {
          return NextResponse.json(
            { error: 'teamId must be a non-empty string or null' },
            { status: 400 }
          );
        }
        // Validate that user belongs to the team if teamId is provided
        // If user has no team (user.teamId is undefined), they cannot assign to any team
        if (!user.teamId || user.teamId !== body.teamId) {
          return NextResponse.json(
            { error: 'You can only assign cases to your own team' },
            { status: 403 }
          );
        }
        updates.teamId = body.teamId;
      } else {
        // teamId is null, remove team assignment
        updates.teamId = undefined;
      }
    }

    // Update case
    const updated = updateCase(id, {
      ...updates,
      statusUpdatedBy: user.id,
    });

    if (!updated) {
      return NextResponse.json(
        { error: 'Failed to update case' },
        { status: 500 }
      );
    }

    return NextResponse.json(updated, {
      headers: {
        'X-RateLimit-Limit': '100',
        'X-RateLimit-Remaining': rateLimit.remaining.toString(),
        'X-RateLimit-Reset': new Date(rateLimit.resetTime).toISOString(),
      },
    });
  } catch (error) {
    console.error('Error updating case:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
