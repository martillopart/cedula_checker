import { NextRequest, NextResponse } from 'next/server';
import { 
  loadTemplatesByUser, 
  loadTemplatesByTeam, 
  loadPublicTemplates,
  saveTemplate 
} from '@/lib/db-users';
import { getCurrentUser } from '@/lib/auth-helpers';
import { checkRateLimit, getClientIP } from '@/lib/rateLimit';
import { CaseTemplate, PropertyInput } from '@/types';
import { 
  sanitizeString, 
  sanitizeStringWithLimit,
  validateMunicipality,
  validateRegion,
  validatePropertyType,
  validateUseCase,
  validateAddress,
  validatePositiveNumber,
  validateBoolean,
} from '@/lib/validation';

export async function GET(request: NextRequest) {
  try {
    const rateLimit = checkRateLimit(getClientIP(request), 200, 15 * 60 * 1000);
    if (!rateLimit.allowed) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }

    const user = await getCurrentUser();
    const { searchParams } = new URL(request.url);
    const scope = searchParams.get('scope') || 'user';

    let templates: CaseTemplate[] = [];

    if (scope === 'public') {
      templates = loadPublicTemplates();
    } else if (user) {
      if (scope === 'team' && user.teamId) {
        templates = loadTemplatesByTeam(user.teamId);
      } else {
        templates = loadTemplatesByUser(user.id);
      }
    }

    return NextResponse.json(templates);
  } catch (error) {
    console.error('Error loading templates:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const rateLimit = checkRateLimit(getClientIP(request), 50, 15 * 60 * 1000);
    if (!rateLimit.allowed) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }

    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let body;
    try {
      body = await request.json();
    } catch (error) {
      return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
    }

    const { name, description, propertyInput, teamId, isPublic } = body;

    if (!name || !propertyInput) {
      return NextResponse.json(
        { error: 'Name and propertyInput are required' },
        { status: 400 }
      );
    }

    // Validate template name
    if (typeof name !== 'string' || name.trim().length === 0 || name.length > 100) {
      return NextResponse.json(
        { error: 'Template name must be between 1 and 100 characters' },
        { status: 400 }
      );
    }

    // Validate propertyInput structure (same validation as cases)
    const municipalityValidation = validateMunicipality(propertyInput.municipality);
    if (!municipalityValidation.valid) {
      return NextResponse.json(
        { error: `propertyInput.municipality: ${municipalityValidation.error}` },
        { status: 400 }
      );
    }

    const regionValidation = validateRegion(propertyInput.region);
    if (!regionValidation.valid) {
      return NextResponse.json(
        { error: `propertyInput.region: ${regionValidation.error}` },
        { status: 400 }
      );
    }

    const propertyTypeValidation = validatePropertyType(propertyInput.propertyType);
    if (!propertyTypeValidation.valid) {
      return NextResponse.json(
        { error: `propertyInput.propertyType: ${propertyTypeValidation.error}` },
        { status: 400 }
      );
    }

    const useCaseValidation = validateUseCase(propertyInput.useCase);
    if (!useCaseValidation.valid) {
      return NextResponse.json(
        { error: `propertyInput.useCase: ${useCaseValidation.error}` },
        { status: 400 }
      );
    }

    // Validate optional fields if present
    if (propertyInput.address !== undefined) {
      const addressValidation = validateAddress(propertyInput.address);
      if (!addressValidation.valid) {
        return NextResponse.json(
          { error: `propertyInput.address: ${addressValidation.error}` },
          { status: 400 }
        );
      }
    }

    // Validate boolean fields
    const hasKitchenValidation = validateBoolean(propertyInput.hasKitchen, 'hasKitchen');
    if (!hasKitchenValidation.valid) {
      return NextResponse.json(
        { error: `propertyInput.hasKitchen: ${hasKitchenValidation.error}` },
        { status: 400 }
      );
    }

    const hasBathroomValidation = validateBoolean(propertyInput.hasBathroom, 'hasBathroom');
    if (!hasBathroomValidation.valid) {
      return NextResponse.json(
        { error: `propertyInput.hasBathroom: ${hasBathroomValidation.error}` },
        { status: 400 }
      );
    }

    const hasNaturalLightValidation = validateBoolean(propertyInput.hasNaturalLight, 'hasNaturalLight');
    if (!hasNaturalLightValidation.valid) {
      return NextResponse.json(
        { error: `propertyInput.hasNaturalLight: ${hasNaturalLightValidation.error}` },
        { status: 400 }
      );
    }

    const hasVentilationValidation = validateBoolean(propertyInput.hasVentilation, 'hasVentilation');
    if (!hasVentilationValidation.valid) {
      return NextResponse.json(
        { error: `propertyInput.hasVentilation: ${hasVentilationValidation.error}` },
        { status: 400 }
      );
    }

    const hasHeatingValidation = validateBoolean(propertyInput.hasHeating, 'hasHeating');
    if (!hasHeatingValidation.valid) {
      return NextResponse.json(
        { error: `propertyInput.hasHeating: ${hasHeatingValidation.error}` },
        { status: 400 }
      );
    }

    // Sanitize and validate numeric fields if present
    const sanitizedPropertyInput: PropertyInput = {
      ...propertyInput,
      municipality: sanitizeStringWithLimit(propertyInput.municipality, 100),
      region: sanitizeStringWithLimit(propertyInput.region, 100),
      propertyType: sanitizeString(propertyInput.propertyType) as PropertyInput['propertyType'],
      useCase: sanitizeString(propertyInput.useCase) as PropertyInput['useCase'],
      address: propertyInput.address ? sanitizeStringWithLimit(propertyInput.address, 200) : undefined,
      notes: propertyInput.notes ? sanitizeStringWithLimit(propertyInput.notes, 2000) : undefined,
    };

    // Validate numeric fields if present
    if (propertyInput.usefulArea !== undefined) {
      const areaValidation = validatePositiveNumber(propertyInput.usefulArea, 'usefulArea', 1, 10000);
      if (!areaValidation.valid) {
        return NextResponse.json(
          { error: `propertyInput.usefulArea: ${areaValidation.error}` },
          { status: 400 }
        );
      }
    }

    if (propertyInput.totalArea !== undefined) {
      const totalAreaValidation = validatePositiveNumber(propertyInput.totalArea, 'totalArea', 1, 100000);
      if (!totalAreaValidation.valid) {
        return NextResponse.json(
          { error: `propertyInput.totalArea: ${totalAreaValidation.error}` },
          { status: 400 }
        );
      }
    }

    if (propertyInput.ceilingHeight !== undefined) {
      const heightValidation = validatePositiveNumber(propertyInput.ceilingHeight, 'ceilingHeight', 0.5, 10);
      if (!heightValidation.valid) {
        return NextResponse.json(
          { error: `propertyInput.ceilingHeight: ${heightValidation.error}` },
          { status: 400 }
        );
      }
    }

    if (propertyInput.numRooms !== undefined) {
      const numRoomsValidation = validatePositiveNumber(propertyInput.numRooms, 'numRooms', 1, 100);
      if (!numRoomsValidation.valid) {
        return NextResponse.json(
          { error: `propertyInput.numRooms: ${numRoomsValidation.error}` },
          { status: 400 }
        );
      }
    }

    if (propertyInput.numBedrooms !== undefined) {
      const numBedroomsValidation = validatePositiveNumber(propertyInput.numBedrooms, 'numBedrooms', 0, 50);
      if (!numBedroomsValidation.valid) {
        return NextResponse.json(
          { error: `propertyInput.numBedrooms: ${numBedroomsValidation.error}` },
          { status: 400 }
        );
      }
    }

    if (propertyInput.numBathrooms !== undefined) {
      const numBathroomsValidation = validatePositiveNumber(propertyInput.numBathrooms, 'numBathrooms', 0, 20);
      if (!numBathroomsValidation.valid) {
        return NextResponse.json(
          { error: `propertyInput.numBathrooms: ${numBathroomsValidation.error}` },
          { status: 400 }
        );
      }
    }

    if (propertyInput.intendedOccupancy !== undefined) {
      const occupancyValidation = validatePositiveNumber(propertyInput.intendedOccupancy, 'intendedOccupancy', 1, 50);
      if (!occupancyValidation.valid) {
        return NextResponse.json(
          { error: `propertyInput.intendedOccupancy: ${occupancyValidation.error}` },
          { status: 400 }
        );
      }
    }

    if (propertyInput.yearBuilt !== undefined) {
      const currentYear = new Date().getFullYear();
      const yearBuiltValidation = validatePositiveNumber(propertyInput.yearBuilt, 'yearBuilt', 1000, currentYear);
      if (!yearBuiltValidation.valid) {
        return NextResponse.json(
          { error: `propertyInput.yearBuilt: ${yearBuiltValidation.error}` },
          { status: 400 }
        );
      }
    }

    if (propertyInput.notes !== undefined && propertyInput.notes !== null) {
      if (typeof propertyInput.notes !== 'string' || propertyInput.notes.length > 2000) {
        return NextResponse.json(
          { error: 'propertyInput.notes must be a string with max 2000 characters' },
          { status: 400 }
        );
      }
    }

    // Validate teamId if provided
    let finalTeamId: string | undefined = undefined;
    if (teamId !== undefined && teamId !== null) {
      if (typeof teamId !== 'string' || teamId.trim().length === 0) {
        return NextResponse.json(
          { error: 'teamId must be a non-empty string' },
          { status: 400 }
        );
      }
      // Validate that user belongs to the team
      // If user has no team (user.teamId is undefined), they cannot assign to any team
      if (!user.teamId || user.teamId !== teamId) {
        return NextResponse.json(
          { error: 'You can only assign templates to your own team' },
          { status: 403 }
        );
      }
      finalTeamId = teamId;
    }

    // Validate isPublic
    if (isPublic !== undefined && typeof isPublic !== 'boolean') {
      return NextResponse.json(
        { error: 'isPublic must be a boolean' },
        { status: 400 }
      );
    }

    const template = saveTemplate({
      name: sanitizeStringWithLimit(name, 100),
      description: description ? sanitizeStringWithLimit(description, 500) : undefined,
      propertyInput: sanitizedPropertyInput,
      createdBy: user.id,
      teamId: finalTeamId,
      isPublic: isPublic === true,
    });

    return NextResponse.json(template, { status: 201 });
  } catch (error) {
    console.error('Error creating template:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
