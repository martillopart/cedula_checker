import { Case } from '@/types';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import path from 'path';

// Use /tmp in serverless environments (Vercel), otherwise use ./data
const isVercel = process.env.VERCEL === '1' || process.env.NEXT_PUBLIC_VERCEL === '1';
const DATA_DIR = isVercel ? '/tmp/data' : path.join(process.cwd(), 'data');
const CASES_FILE = path.join(DATA_DIR, 'cases.json');

// Lazy initialization to avoid issues in serverless environments
function ensureDataDirectory() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(CASES_FILE)) {
      fs.writeFileSync(CASES_FILE, JSON.stringify([], null, 2));
    }
  } catch (error) {
    // If we can't write to filesystem (serverless), use in-memory storage
    console.warn('Cannot write to filesystem, using in-memory storage:', error);
  }
}

export function saveCase(caseData: Omit<Case, 'id' | 'shareId'>): Case {
  ensureDataDirectory();
  const cases = loadAllCases();
  const now = new Date().toISOString();
  const newCase: Case = {
    ...caseData,
    id: uuidv4(),
    shareId: uuidv4().replace(/-/g, '').substring(0, 16),
    // Phase 2: Default values for new fields
    status: caseData.status || 'new',
    statusUpdatedAt: caseData.statusUpdatedAt || now,
  };
  
  cases.push(newCase);
  try {
    fs.writeFileSync(CASES_FILE, JSON.stringify(cases, null, 2));
  } catch (error) {
    console.warn('Cannot write case to filesystem (serverless environment):', error);
    // In serverless, we can't persist, but we still return the case
    // The case will be lost on next invocation, but at least the API won't fail
  }
  
  return newCase;
}

export function updateCase(id: string, updates: Partial<Case & { statusUpdatedBy?: string }>): Case | null {
  ensureDataDirectory();
  const cases = loadAllCases();
  const index = cases.findIndex((c) => c.id === id);
  
  if (index === -1) {
    return null;
  }
  
  const { statusUpdatedBy, ...caseUpdates } = updates;
  const updatedCase: Case = {
    ...cases[index],
    ...caseUpdates,
    statusUpdatedAt: updates.status ? new Date().toISOString() : cases[index].statusUpdatedAt,
    statusUpdatedBy: statusUpdatedBy || cases[index].statusUpdatedBy,
  };
  
  cases[index] = updatedCase;
  try {
    fs.writeFileSync(CASES_FILE, JSON.stringify(cases, null, 2));
  } catch (error) {
    console.warn('Cannot update case in filesystem (serverless environment):', error);
    // In serverless, we can't persist, but we still return the updated case
  }
  
  return updatedCase;
}

export function loadCasesByUser(userId: string): Case[] {
  ensureDataDirectory();
  const cases = loadAllCases();
  return cases.filter((c) => c.userId === userId);
}

export function loadCasesByTeam(teamId: string): Case[] {
  ensureDataDirectory();
  const cases = loadAllCases();
  return cases.filter((c) => c.teamId === teamId);
}

export function loadCase(id: string): Case | null {
  ensureDataDirectory();
  const cases = loadAllCases();
  return cases.find((c) => c.id === id) || null;
}

export function loadCaseByShareId(shareId: string): Case | null {
  ensureDataDirectory();
  const cases = loadAllCases();
  return cases.find((c) => c.shareId === shareId) || null;
}

export function loadAllCases(): Case[] {
  ensureDataDirectory();
  try {
    const data = fs.readFileSync(CASES_FILE, 'utf-8');
    const parsed = JSON.parse(data);
    // Ensure we return an array
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    return [];
  }
}
