/**
 * Input validation utilities for production safety
 */

export interface ValidationResult {
  valid: boolean;
  error?: string;
}

/**
 * Sanitize string input to prevent XSS
 * Removes potentially dangerous characters (< and >) and trims whitespace.
 * Note: This function does NOT limit length. Use sanitizeStringWithLimit() if length limiting is needed.
 */
export function sanitizeString(input: string | undefined | null): string {
  if (!input || typeof input !== 'string') {
    return '';
  }
  // Remove potentially dangerous characters
  return input
    .replace(/[<>]/g, '')
    .trim();
}

/**
 * Sanitize string with length limit
 */
export function sanitizeStringWithLimit(input: string | undefined | null, maxLength: number = 1000): string {
  if (!input || typeof input !== 'string') {
    return '';
  }
  // Remove potentially dangerous characters
  return input
    .replace(/[<>]/g, '')
    .trim()
    .substring(0, maxLength);
}

/**
 * Validate municipality name
 */
export function validateMunicipality(municipality: string | undefined | null): ValidationResult {
  if (!municipality || typeof municipality !== 'string') {
    return { valid: false, error: 'El camp "Municipi" és obligatori' };
  }
  const sanitized = sanitizeStringWithLimit(municipality, 100);
  if (sanitized.length < 2 || sanitized.length > 100) {
    return { valid: false, error: 'El municipi ha de tenir entre 2 i 100 caràcters' };
  }
  return { valid: true };
}

/**
 * Validate region name
 */
export function validateRegion(region: string | undefined | null): ValidationResult {
  if (!region || typeof region !== 'string') {
    return { valid: false, error: 'El camp "Regió" és obligatori' };
  }
  const sanitized = sanitizeStringWithLimit(region, 100);
  if (sanitized.length < 2 || sanitized.length > 100) {
    return { valid: false, error: 'La regió ha de tenir entre 2 i 100 caràcters' };
  }
  return { valid: true };
}

/**
 * Validate property type
 */
export function validatePropertyType(propertyType: string | undefined | null): ValidationResult {
  const validTypes = ['flat', 'house', 'studio', 'other'];
  if (!propertyType || typeof propertyType !== 'string') {
    return { valid: false, error: 'El camp "Tipus de Propietat" és obligatori' };
  }
  if (!validTypes.includes(propertyType)) {
    return { valid: false, error: 'Tipus de propietat no vàlid' };
  }
  return { valid: true };
}

/**
 * Validate use case
 */
export function validateUseCase(useCase: string | undefined | null): ValidationResult {
  const validUseCases = ['segunda-ocupacion', 'primera-ocupacion', 'renovation'];
  if (!useCase || typeof useCase !== 'string') {
    return { valid: false, error: 'El camp "Ús" és obligatori' };
  }
  if (!validUseCases.includes(useCase)) {
    return { valid: false, error: 'Ús no vàlid' };
  }
  return { valid: true };
}

/**
 * Validate numeric input (positive number)
 */
export function validatePositiveNumber(
  value: number | undefined | null,
  fieldName: string,
  min: number = 0.01,
  max: number = 100000
): ValidationResult {
  if (value === undefined || value === null) {
    return { valid: true }; // Optional field
  }
  if (typeof value !== 'number' || isNaN(value)) {
    return { valid: false, error: `${fieldName} must be a valid number` };
  }
  // Allow 0 if min is 0 or less, otherwise require > 0
  if (min > 0 && value <= 0) {
    return { valid: false, error: `${fieldName} must be greater than 0` };
  }
  if (value < min || value > max) {
    return { valid: false, error: `${fieldName} must be between ${min} and ${max}` };
  }
  return { valid: true };
}

/**
 * Validate UUID format
 */
export function validateUUID(uuid: string | undefined | null): ValidationResult {
  if (!uuid || typeof uuid !== 'string') {
    return { valid: false, error: 'ID is required' };
  }
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(uuid)) {
    return { valid: false, error: 'Invalid ID format' };
  }
  return { valid: true };
}

/**
 * Validate share ID format (16 character hex)
 */
export function validateShareId(shareId: string | undefined | null): ValidationResult {
  if (!shareId || typeof shareId !== 'string') {
    return { valid: false, error: 'Share ID is required' };
  }
  const shareIdRegex = /^[0-9a-f]{16}$/i;
  if (!shareIdRegex.test(shareId)) {
    return { valid: false, error: 'Invalid share ID format' };
  }
  return { valid: true };
}

/**
 * Validate address string
 */
export function validateAddress(address: string | undefined | null): ValidationResult {
  if (!address) {
    return { valid: true }; // Optional field
  }
  if (typeof address !== 'string') {
    return { valid: false, error: 'Address must be a string' };
  }
  const sanitized = sanitizeStringWithLimit(address, 200);
  if (sanitized.length > 200) {
    return { valid: false, error: 'Address must be less than 200 characters' };
  }
  return { valid: true };
}

/**
 * Validate boolean value
 */
export function validateBoolean(value: boolean | undefined | null, fieldName: string): ValidationResult {
  if (value === undefined || value === null) {
    return { valid: false, error: `${fieldName} is required` };
  }
  if (typeof value !== 'boolean') {
    return { valid: false, error: `${fieldName} must be a boolean` };
  }
  return { valid: true };
}

/**
 * Validate email format
 */
export function validateEmail(email: string | undefined | null): ValidationResult {
  if (!email || typeof email !== 'string') {
    return { valid: false, error: 'Email is required' };
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { valid: false, error: 'Invalid email format' };
  }
  return { valid: true };
}
