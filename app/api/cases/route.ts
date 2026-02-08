import { NextRequest, NextResponse } from 'next/server';
import { saveCase, loadCasesByUser } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth-helpers';
import { PropertyInput, EvaluationResult } from '@/types';
import { checkRateLimit, getClientIP } from '@/lib/rateLimit';
import {
  validateMunicipality,
  validateRegion,
  validatePropertyType,
  validateUseCase,
  validatePositiveNumber,
  validateAddress,
  validateBoolean,
  sanitizeString,
  sanitizeStringWithLimit,
} from '@/lib/validation';
import { evaluateProperty } from '@/lib/rules/catalonia';

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    
    if (user) {
      // Return user's cases
      const cases = loadCasesByUser(user.id);
      return NextResponse.json(cases);
    } else {
      // For backward compatibility, return empty array if not authenticated
      return NextResponse.json([]);
    }
  } catch (error) {
    console.error('Error loading cases:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const clientIP = getClientIP(request);
    const rateLimit = checkRateLimit(
      clientIP,
      parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10),
      parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10)
    );

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

    // Parse request body
    let body;
    try {
      body = await request.json();
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid JSON in request body' },
        { status: 400 }
      );
    }

    const { propertyInput, evaluationResult: providedEvaluationResult } = body;

    if (!propertyInput) {
      return NextResponse.json(
        { error: 'Missing required field: propertyInput is required' },
        { status: 400 }
      );
    }

    // Comprehensive validation using validation utilities
    const municipalityValidation = validateMunicipality(propertyInput.municipality);
    if (!municipalityValidation.valid) {
      return NextResponse.json(
        { error: municipalityValidation.error },
        { status: 400 }
      );
    }

    const regionValidation = validateRegion(propertyInput.region);
    if (!regionValidation.valid) {
      return NextResponse.json(
        { error: regionValidation.error },
        { status: 400 }
      );
    }

    const propertyTypeValidation = validatePropertyType(propertyInput.propertyType);
    if (!propertyTypeValidation.valid) {
      return NextResponse.json(
        { error: propertyTypeValidation.error },
        { status: 400 }
      );
    }

    const useCaseValidation = validateUseCase(propertyInput.useCase);
    if (!useCaseValidation.valid) {
      return NextResponse.json(
        { error: useCaseValidation.error },
        { status: 400 }
      );
    }

    // Validate optional fields
    if (propertyInput.address !== undefined) {
      const addressValidation = validateAddress(propertyInput.address);
      if (!addressValidation.valid) {
        return NextResponse.json(
          { error: addressValidation.error },
          { status: 400 }
        );
      }
    }

    if (propertyInput.usefulArea !== undefined) {
      const areaValidation = validatePositiveNumber(propertyInput.usefulArea, 'Useful area', 1, 10000);
      if (!areaValidation.valid) {
        return NextResponse.json(
          { error: areaValidation.error },
          { status: 400 }
        );
      }
    }

    if (propertyInput.ceilingHeight !== undefined) {
      const heightValidation = validatePositiveNumber(propertyInput.ceilingHeight, 'Ceiling height', 0.5, 10);
      if (!heightValidation.valid) {
        return NextResponse.json(
          { error: heightValidation.error },
          { status: 400 }
        );
      }
    }

    if (propertyInput.intendedOccupancy !== undefined) {
      const occupancyValidation = validatePositiveNumber(propertyInput.intendedOccupancy, 'Intended occupancy', 1, 50);
      if (!occupancyValidation.valid) {
        return NextResponse.json(
          { error: occupancyValidation.error },
          { status: 400 }
        );
      }
    }

    if (propertyInput.totalArea !== undefined) {
      const totalAreaValidation = validatePositiveNumber(propertyInput.totalArea, 'Total area', 1, 100000);
      if (!totalAreaValidation.valid) {
        return NextResponse.json(
          { error: totalAreaValidation.error },
          { status: 400 }
        );
      }
    }

    if (propertyInput.numRooms !== undefined) {
      const numRoomsValidation = validatePositiveNumber(propertyInput.numRooms, 'Number of rooms', 1, 100);
      if (!numRoomsValidation.valid) {
        return NextResponse.json(
          { error: numRoomsValidation.error },
          { status: 400 }
        );
      }
    }

    if (propertyInput.numBedrooms !== undefined) {
      const numBedroomsValidation = validatePositiveNumber(propertyInput.numBedrooms, 'Number of bedrooms', 0, 50);
      if (!numBedroomsValidation.valid) {
        return NextResponse.json(
          { error: numBedroomsValidation.error },
          { status: 400 }
        );
      }
    }

    if (propertyInput.numBathrooms !== undefined) {
      const numBathroomsValidation = validatePositiveNumber(propertyInput.numBathrooms, 'Number of bathrooms', 0, 20);
      if (!numBathroomsValidation.valid) {
        return NextResponse.json(
          { error: numBathroomsValidation.error },
          { status: 400 }
        );
      }
    }

    if (propertyInput.numFloors !== undefined) {
      const numFloorsValidation = validatePositiveNumber(propertyInput.numFloors, 'Number of floors', 1, 50);
      if (!numFloorsValidation.valid) {
        return NextResponse.json(
          { error: numFloorsValidation.error },
          { status: 400 }
        );
      }
    }

    if (propertyInput.yearBuilt !== undefined) {
      const currentYear = new Date().getFullYear();
      const yearBuiltValidation = validatePositiveNumber(propertyInput.yearBuilt, 'Year built', 1000, currentYear);
      if (!yearBuiltValidation.valid) {
        return NextResponse.json(
          { error: yearBuiltValidation.error },
          { status: 400 }
        );
      }
    }

    // Validate notes (optional field)
    if (propertyInput.notes !== undefined && propertyInput.notes !== null) {
      if (typeof propertyInput.notes !== 'string') {
        return NextResponse.json(
          { error: 'Notes must be a string' },
          { status: 400 }
        );
      }
      if (propertyInput.notes.length > 2000) {
        return NextResponse.json(
          { error: 'Notes must be less than 2000 characters' },
          { status: 400 }
        );
      }
    }

    // Validate boolean fields
    const hasKitchenValidation = validateBoolean(propertyInput.hasKitchen, 'hasKitchen');
    if (!hasKitchenValidation.valid) {
      return NextResponse.json(
        { error: hasKitchenValidation.error },
        { status: 400 }
      );
    }

    const hasBathroomValidation = validateBoolean(propertyInput.hasBathroom, 'hasBathroom');
    if (!hasBathroomValidation.valid) {
      return NextResponse.json(
        { error: hasBathroomValidation.error },
        { status: 400 }
      );
    }

    const hasNaturalLightValidation = validateBoolean(propertyInput.hasNaturalLight, 'hasNaturalLight');
    if (!hasNaturalLightValidation.valid) {
      return NextResponse.json(
        { error: hasNaturalLightValidation.error },
        { status: 400 }
      );
    }

    const hasVentilationValidation = validateBoolean(propertyInput.hasVentilation, 'hasVentilation');
    if (!hasVentilationValidation.valid) {
      return NextResponse.json(
        { error: hasVentilationValidation.error },
        { status: 400 }
      );
    }

    const hasHeatingValidation = validateBoolean(propertyInput.hasHeating, 'hasHeating');
    if (!hasHeatingValidation.valid) {
      return NextResponse.json(
        { error: hasHeatingValidation.error },
        { status: 400 }
      );
    }

    // Validate new detailed requirement boolean fields (optional)
    if (propertyInput.hasRunningWater !== undefined) {
      const hasRunningWaterValidation = validateBoolean(propertyInput.hasRunningWater, 'hasRunningWater');
      if (!hasRunningWaterValidation.valid) {
        return NextResponse.json(
          { error: hasRunningWaterValidation.error },
          { status: 400 }
        );
      }
    }

    if (propertyInput.hasHotWater !== undefined) {
      const hasHotWaterValidation = validateBoolean(propertyInput.hasHotWater, 'hasHotWater');
      if (!hasHotWaterValidation.valid) {
        return NextResponse.json(
          { error: hasHotWaterValidation.error },
          { status: 400 }
        );
      }
    }

    if (propertyInput.hasDrainage !== undefined) {
      const hasDrainageValidation = validateBoolean(propertyInput.hasDrainage, 'hasDrainage');
      if (!hasDrainageValidation.valid) {
        return NextResponse.json(
          { error: hasDrainageValidation.error },
          { status: 400 }
        );
      }
    }

    if (propertyInput.hasWC !== undefined) {
      const hasWCValidation = validateBoolean(propertyInput.hasWC, 'hasWC');
      if (!hasWCValidation.valid) {
        return NextResponse.json(
          { error: hasWCValidation.error },
          { status: 400 }
        );
      }
    }

    if (propertyInput.hasShowerOrBath !== undefined) {
      const hasShowerOrBathValidation = validateBoolean(propertyInput.hasShowerOrBath, 'hasShowerOrBath');
      if (!hasShowerOrBathValidation.valid) {
        return NextResponse.json(
          { error: hasShowerOrBathValidation.error },
          { status: 400 }
        );
      }
    }

    if (propertyInput.hasCookingAppliance !== undefined) {
      const hasCookingApplianceValidation = validateBoolean(propertyInput.hasCookingAppliance, 'hasCookingAppliance');
      if (!hasCookingApplianceValidation.valid) {
        return NextResponse.json(
          { error: hasCookingApplianceValidation.error },
          { status: 400 }
        );
      }
    }

    if (propertyInput.hasElectricalInstallation !== undefined) {
      const hasElectricalInstallationValidation = validateBoolean(propertyInput.hasElectricalInstallation, 'hasElectricalInstallation');
      if (!hasElectricalInstallationValidation.valid) {
        return NextResponse.json(
          { error: hasElectricalInstallationValidation.error },
          { status: 400 }
        );
      }
    }

    if (propertyInput.hasEnergyCertificate !== undefined) {
    const hasEnergyCertificateValidation = validateBoolean(propertyInput.hasEnergyCertificate, 'hasEnergyCertificate');
    if (!hasEnergyCertificateValidation.valid) {
      return NextResponse.json(
        { error: hasEnergyCertificateValidation.error },
        { status: 400 }
      );
    }

    if (propertyInput.hasGas !== undefined) {
      const hasGasValidation = validateBoolean(propertyInput.hasGas, 'hasGas');
      if (!hasGasValidation.valid) {
        return NextResponse.json(
          { error: hasGasValidation.error },
          { status: 400 }
        );
      }
    }

    if (propertyInput.hasGasInstallation !== undefined) {
      const hasGasInstallationValidation = validateBoolean(propertyInput.hasGasInstallation, 'hasGasInstallation');
      if (!hasGasInstallationValidation.valid) {
        return NextResponse.json(
          { error: hasGasInstallationValidation.error },
          { status: 400 }
        );
      }
    }
    }

    // Evaluate property (use provided evaluationResult if available, otherwise evaluate)
    let evaluationResult: EvaluationResult;
    if (providedEvaluationResult && providedEvaluationResult.rules && Array.isArray(providedEvaluationResult.rules)) {
      // Validate provided evaluation result
      if (providedEvaluationResult.rules.length > 100) {
        return NextResponse.json(
          { error: 'Too many rules in evaluation result' },
          { status: 400 }
        );
      }
      evaluationResult = providedEvaluationResult as EvaluationResult;
    } else {
      // Evaluate using rules engine
      evaluationResult = evaluateProperty(propertyInput as PropertyInput);
    }

    // Sanitize all string fields before saving (security: prevent XSS in stored data)
    const sanitizedPropertyInput: PropertyInput = {
      ...propertyInput,
      municipality: sanitizeStringWithLimit(propertyInput.municipality, 100),
      region: sanitizeStringWithLimit(propertyInput.region, 100),
      propertyType: sanitizeString(propertyInput.propertyType) as PropertyInput['propertyType'],
      useCase: sanitizeString(propertyInput.useCase) as PropertyInput['useCase'],
      address: propertyInput.address ? sanitizeStringWithLimit(propertyInput.address, 200) : undefined,
      notes: propertyInput.notes ? sanitizeStringWithLimit(propertyInput.notes, 2000) : undefined,
    };

    // Get current user if authenticated (optional for backward compatibility)
    let userId: string | undefined;
    try {
      const user = await getCurrentUser();
      userId = user?.id;
    } catch (error) {
      // Not authenticated, continue without userId
    }

    const now = new Date().toISOString();
    const caseData = saveCase({
      propertyInput: sanitizedPropertyInput as PropertyInput,
      evaluationResult,
      createdAt: now,
      status: 'new',
      statusUpdatedAt: now,
      userId,
    });

    return NextResponse.json(caseData, {
      headers: {
        'X-RateLimit-Limit': '100',
        'X-RateLimit-Remaining': rateLimit.remaining.toString(),
        'X-RateLimit-Reset': new Date(rateLimit.resetTime).toISOString(),
      },
    });
  } catch (error) {
    console.error('Error saving case:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorStack = error instanceof Error ? error.stack : undefined;
    console.error('Error details:', { errorMessage, errorStack });
    return NextResponse.json(
      { error: 'Internal server error', details: process.env.NODE_ENV === 'development' ? errorMessage : undefined },
      { status: 500 }
    );
  }
}
