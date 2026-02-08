import { User, Team, TeamMember, CaseTemplate, Evidence } from '@/types';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const TEAMS_FILE = path.join(DATA_DIR, 'teams.json');
const TEAM_MEMBERS_FILE = path.join(DATA_DIR, 'team-members.json');
const TEMPLATES_FILE = path.join(DATA_DIR, 'templates.json');
const EVIDENCE_DIR = path.join(DATA_DIR, 'evidence');
const EVIDENCE_FILE = path.join(DATA_DIR, 'evidence.json');

function ensureDataDirectory() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(EVIDENCE_DIR)) {
    fs.mkdirSync(EVIDENCE_DIR, { recursive: true });
  }
  if (!fs.existsSync(USERS_FILE)) {
    fs.writeFileSync(USERS_FILE, JSON.stringify([], null, 2));
  }
  if (!fs.existsSync(TEAMS_FILE)) {
    fs.writeFileSync(TEAMS_FILE, JSON.stringify([], null, 2));
  }
  if (!fs.existsSync(TEAM_MEMBERS_FILE)) {
    fs.writeFileSync(TEAM_MEMBERS_FILE, JSON.stringify([], null, 2));
  }
  if (!fs.existsSync(TEMPLATES_FILE)) {
    fs.writeFileSync(TEMPLATES_FILE, JSON.stringify([], null, 2));
  }
  if (!fs.existsSync(EVIDENCE_FILE)) {
    fs.writeFileSync(EVIDENCE_FILE, JSON.stringify([], null, 2));
  }
}

// User functions
export function saveUser(userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): User {
  ensureDataDirectory();
  const users = loadAllUsers();
  const now = new Date().toISOString();
  const newUser: User = {
    ...userData,
    id: uuidv4(),
    createdAt: now,
    updatedAt: now,
  };
  
  users.push(newUser);
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
  
  return newUser;
}

export function updateUser(id: string, updates: Partial<User>): User | null {
  ensureDataDirectory();
  const users = loadAllUsers();
  const index = users.findIndex((u) => u.id === id);
  
  if (index === -1) {
    return null;
  }
  
  const updatedUser: User = {
    ...users[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  };
  
  users[index] = updatedUser;
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
  
  return updatedUser;
}

export function loadUser(id: string): User | null {
  ensureDataDirectory();
  const users = loadAllUsers();
  return users.find((u) => u.id === id) || null;
}

export function loadUserByEmail(email: string): User | null {
  ensureDataDirectory();
  const users = loadAllUsers();
  return users.find((u) => u.email === email) || null;
}

export function loadAllUsers(): User[] {
  ensureDataDirectory();
  try {
    const data = fs.readFileSync(USERS_FILE, 'utf-8');
    const parsed = JSON.parse(data);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    return [];
  }
}

// Team functions
export function saveTeam(teamData: Omit<Team, 'id' | 'createdAt' | 'updatedAt'>): Team {
  ensureDataDirectory();
  const teams = loadAllTeams();
  const now = new Date().toISOString();
  const newTeam: Team = {
    ...teamData,
    id: uuidv4(),
    createdAt: now,
    updatedAt: now,
  };
  
  teams.push(newTeam);
  fs.writeFileSync(TEAMS_FILE, JSON.stringify(teams, null, 2));
  
  return newTeam;
}

export function loadTeam(id: string): Team | null {
  ensureDataDirectory();
  const teams = loadAllTeams();
  return teams.find((t) => t.id === id) || null;
}

export function loadAllTeams(): Team[] {
  ensureDataDirectory();
  try {
    const data = fs.readFileSync(TEAMS_FILE, 'utf-8');
    const parsed = JSON.parse(data);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    return [];
  }
}

// Team member functions
export function addTeamMember(memberData: Omit<TeamMember, 'id' | 'joinedAt'>): TeamMember {
  ensureDataDirectory();
  const members = loadAllTeamMembers();
  const newMember: TeamMember = {
    ...memberData,
    id: uuidv4(),
    joinedAt: new Date().toISOString(),
  };
  
  members.push(newMember);
  fs.writeFileSync(TEAM_MEMBERS_FILE, JSON.stringify(members, null, 2));
  
  return newMember;
}

export function loadTeamMember(teamId: string, userId: string): TeamMember | null {
  ensureDataDirectory();
  const members = loadAllTeamMembers();
  return members.find((m) => m.teamId === teamId && m.userId === userId) || null;
}

export function loadTeamMembers(teamId: string): TeamMember[] {
  ensureDataDirectory();
  const members = loadAllTeamMembers();
  return members.filter((m) => m.teamId === teamId);
}

export function loadAllTeamMembers(): TeamMember[] {
  ensureDataDirectory();
  try {
    const data = fs.readFileSync(TEAM_MEMBERS_FILE, 'utf-8');
    const parsed = JSON.parse(data);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    return [];
  }
}

// Template functions
export function saveTemplate(templateData: Omit<CaseTemplate, 'id' | 'createdAt' | 'updatedAt'>): CaseTemplate {
  ensureDataDirectory();
  const templates = loadAllTemplates();
  const now = new Date().toISOString();
  const newTemplate: CaseTemplate = {
    ...templateData,
    id: uuidv4(),
    createdAt: now,
    updatedAt: now,
  };
  
  templates.push(newTemplate);
  fs.writeFileSync(TEMPLATES_FILE, JSON.stringify(templates, null, 2));
  
  return newTemplate;
}

export function loadTemplate(id: string): CaseTemplate | null {
  ensureDataDirectory();
  const templates = loadAllTemplates();
  return templates.find((t) => t.id === id) || null;
}

export function loadTemplatesByUser(userId: string): CaseTemplate[] {
  ensureDataDirectory();
  const templates = loadAllTemplates();
  return templates.filter((t) => t.createdBy === userId && !t.teamId);
}

export function loadTemplatesByTeam(teamId: string): CaseTemplate[] {
  ensureDataDirectory();
  const templates = loadAllTemplates();
  return templates.filter((t) => t.teamId === teamId);
}

export function loadPublicTemplates(): CaseTemplate[] {
  ensureDataDirectory();
  const templates = loadAllTemplates();
  return templates.filter((t) => t.isPublic);
}

export function loadAllTemplates(): CaseTemplate[] {
  ensureDataDirectory();
  try {
    const data = fs.readFileSync(TEMPLATES_FILE, 'utf-8');
    const parsed = JSON.parse(data);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    return [];
  }
}

export function deleteTemplate(id: string): boolean {
  ensureDataDirectory();
  const templates = loadAllTemplates();
  const index = templates.findIndex((t) => t.id === id);
  
  if (index === -1) {
    return false;
  }
  
  templates.splice(index, 1);
  fs.writeFileSync(TEMPLATES_FILE, JSON.stringify(templates, null, 2));
  
  return true;
}

// Evidence functions
export function saveEvidence(evidenceData: Omit<Evidence, 'id' | 'uploadedAt'>): Evidence {
  ensureDataDirectory();
  const evidence = loadAllEvidence();
  const newEvidence: Evidence = {
    ...evidenceData,
    id: uuidv4(),
    uploadedAt: new Date().toISOString(),
  };
  
  evidence.push(newEvidence);
  fs.writeFileSync(EVIDENCE_FILE, JSON.stringify(evidence, null, 2));
  
  return newEvidence;
}

export function loadEvidence(id: string): Evidence | null {
  ensureDataDirectory();
  const evidence = loadAllEvidence();
  return evidence.find((e) => e.id === id) || null;
}

export function loadEvidenceByCase(caseId: string): Evidence[] {
  ensureDataDirectory();
  const evidence = loadAllEvidence();
  return evidence.filter((e) => e.caseId === caseId);
}

export function loadAllEvidence(): Evidence[] {
  ensureDataDirectory();
  try {
    const data = fs.readFileSync(EVIDENCE_FILE, 'utf-8');
    const parsed = JSON.parse(data);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    return [];
  }
}

export function deleteEvidence(id: string): boolean {
  ensureDataDirectory();
  const evidence = loadAllEvidence();
  const index = evidence.findIndex((e) => e.id === id);
  
  if (index === -1) {
    return false;
  }
  
  const ev = evidence[index];
  // Delete the actual file
  try {
    const filePath = path.join(EVIDENCE_DIR, ev.url);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  } catch (error) {
    // File might not exist, continue
  }
  
  evidence.splice(index, 1);
  fs.writeFileSync(EVIDENCE_FILE, JSON.stringify(evidence, null, 2));
  
  return true;
}
