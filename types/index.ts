export type RuleSeverity = 'pass' | 'risk' | 'fail' | 'unknown';

export type PropertyType = 'flat' | 'house' | 'studio' | 'other';
export type UseCase = 'segunda-ocupacion' | 'primera-ocupacion' | 'renovation';

// Phase 2: Case Status Pipeline
export type CaseStatus = 'new' | 'waiting' | 'scheduled' | 'ready' | 'submitted' | 'done';

// Phase 2: User and Team Types
export type UserRole = 'owner' | 'admin' | 'member' | 'viewer';
export type TeamRole = 'owner' | 'admin' | 'member' | 'viewer';

export interface User {
  id: string;
  email: string;
  name: string;
  image?: string;
  password?: string; // Hashed password
  role: UserRole;
  teamId?: string;
  teamRole?: TeamRole;
  createdAt: string;
  updatedAt: string;
}

export interface Team {
  id: string;
  name: string;
  ownerId: string;
  plan: 'free' | 'solo' | 'team';
  createdAt: string;
  updatedAt: string;
}

export interface TeamMember {
  id: string;
  teamId: string;
  userId: string;
  role: TeamRole;
  joinedAt: string;
}

// Phase 2: Evidence Types
export interface Evidence {
  id: string;
  caseId: string;
  type: 'photo' | 'document';
  filename: string;
  originalFilename: string;
  mimeType: string;
  size: number; // bytes
  url: string; // path or URL to file
  uploadedBy: string; // userId
  uploadedAt: string;
  description?: string;
}

// Phase 2: Template Types
export interface CaseTemplate {
  id: string;
  name: string;
  description?: string;
  propertyInput: PropertyInput;
  createdBy: string; // userId
  teamId?: string; // null for personal templates
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PropertyInput {
  address?: string;
  municipality: string;
  region: string;
  propertyType: PropertyType;
  useCase: UseCase;
  yearBuilt?: number;
  
  // Measurements
  usefulArea?: number; // m²
  totalArea?: number; // m²
  ceilingHeight?: number; // meters
  numRooms?: number;
  numBedrooms?: number;
  numBathrooms?: number;
  
  // Facilities
  hasKitchen: boolean;
  hasBathroom: boolean;
  hasNaturalLight: boolean;
  hasVentilation: boolean;
  hasHeating: boolean;
  
  // Occupancy
  intendedOccupancy?: number; // number of people
  
  // Additional info
  notes?: string;
}

export interface RuleResult {
  ruleId: string;
  ruleName: string;
  severity: RuleSeverity;
  message: string;
  explanation: string;
  fixGuidance?: string;
  evidenceUsed: string[];
  confidence: number; // 0-100
}

export interface EvaluationResult {
  overallStatus: RuleSeverity;
  confidence: number;
  rules: RuleResult[];
  missingEvidence: string[];
  fixPlan: string[];
  timestamp: string;
  rulesetVersion: string;
}

export interface Case {
  id: string;
  propertyInput: PropertyInput;
  evaluationResult: EvaluationResult;
  createdAt: string;
  shareId?: string;
  
  // Phase 2: Extended fields
  userId?: string; // Owner of the case
  teamId?: string; // Team the case belongs to
  status: CaseStatus;
  statusUpdatedAt: string;
  statusUpdatedBy?: string; // userId
  assignedTo?: string; // userId
  scheduledDate?: string; // ISO date string
  submittedDate?: string; // ISO date string
  completedDate?: string; // ISO date string
  notes?: string; // Case-specific notes
  tags?: string[]; // Tags for organization
}
