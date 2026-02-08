# Cédula de Habitabilidad Checker

A web-based tool for checking property requirements for the cédula de habitabilidad (habitability certificate) in Spain, starting with Catalonia. Built with Next.js 14, TypeScript, and a focus on security, validation, and user experience.

## Features

### Phase 1 (MVP) - ✅ Complete
- ✅ **Guided Property Intake Form** - Fast, user-friendly form to input property details
- ✅ **Rules Engine** - Evaluates against Catalonia requirements (Decret 141/2012)
- ✅ **Smart Evaluation** - Pass/Risk/Fail/Unknown results with confidence scores
- ✅ **Client-Ready PDF Reports** - Professional PDF reports ready to share with clients
- ✅ **Share Links** - Generate shareable links for reports
- ✅ **Pricing Page** - Clear pricing structure for different user tiers

### Phase 2 - ✅ Complete
- ✅ **User Authentication** - Secure email/password authentication with NextAuth.js
- ✅ **Gmail Login** - OAuth authentication with Google/Gmail
- ✅ **Team Accounts & Permissions** - Team management with role-based access control
- ✅ **Case Pipeline** - Complete workflow: New → Waiting → Scheduled → Ready → Submitted → Done
- ✅ **Templates** - Reusable case templates for faster property input
- ✅ **Evidence Capture** - Upload photos and documents associated with cases
- ✅ **Dashboard** - User dashboard to manage all cases
- ✅ **Comprehensive Validation** - All inputs validated and sanitized for security
- ✅ **Rate Limiting** - API protection against abuse
- ✅ **Access Control** - Secure case and resource ownership

## Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd cedula
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables (optional):
```bash
# Create .env.local file
NEXTAUTH_SECRET=your-secret-key-change-in-production
NEXTAUTH_URL=http://localhost:3000

# For Gmail/Google OAuth (optional but recommended)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

### Building for Production
```bash
npm run build
npm start
```

## Tech Stack

- **Next.js 14** - React framework with App Router
- **TypeScript** - Full type safety throughout
- **Tailwind CSS** - Modern styling
- **NextAuth.js** - Authentication and session management
- **bcryptjs** - Password hashing
- **jsPDF + jspdf-autotable** - PDF generation
- **File-based storage** - JSON file storage (easily upgradeable to database)

## Project Structure

```
├── app/
│   ├── api/                    # API routes (auth, cases, templates, evidence, pdf, share)
│   ├── auth/                   # Authentication pages (signin, signup)
│   ├── dashboard/              # User dashboard
│   ├── cases/                  # Case detail pages
│   ├── templates/              # Template management UI
│   ├── results/                # Results display
│   ├── share/                  # Public share pages
│   └── pricing/                # Pricing page
├── components/                 # Reusable React components
├── lib/                        # Utilities (auth, db, validation, rateLimit, rules, pdf)
├── types/                      # TypeScript type definitions
└── data/                       # JSON file storage (cases, users, teams, templates, evidence)
```

## API Documentation

### Authentication
- **POST /api/auth/signup** - Create a new user account
- **POST /api/auth/[...nextauth]** - NextAuth.js endpoint (Credentials & Google OAuth)

### Cases
- **GET /api/cases** - Get all cases for authenticated user
- **POST /api/cases** - Create a new case
- **GET /api/cases/[id]** - Get specific case
- **PATCH /api/cases/[id]** - Update case (status, assignment, dates, notes, tags)

### Templates
- **GET /api/templates?scope=user|team|public** - Get templates by scope
- **POST /api/templates** - Create a new template

### Evidence
- **GET /api/evidence?caseId=uuid** - Get evidence for a case
- **POST /api/evidence** - Upload evidence (FormData, max 10MB, JPEG/PNG/WebP/PDF/DOC/DOCX)

### PDF & Sharing
- **GET /api/pdf/[id]** - Download PDF report
- **GET /api/share/[shareId]** - Get case by share ID (public access)

## User Guide

### Authentication
1. **Sign Up**: Navigate to `/auth/signup` (email, password min 8 chars, name required)
2. **Sign In**: Navigate to `/auth/signin` (email/password or Gmail/Google OAuth)
3. **Session**: Managed automatically by NextAuth.js

### Case Management
- **Creating**: Fill property form on home page (`/`), submit to create and evaluate
- **Pipeline**: New → Waiting → Scheduled → Ready → Submitted → Done
- **Updating**: Navigate to `/cases/[id]` to update status, assign, set dates, add notes/tags
- **Viewing**: Dashboard (`/dashboard`) for all cases, case detail page for full information

### Templates
- **Creating**: Navigate to `/templates`, create template with property input
- **Using**: Select template to pre-fill new case form

### Evidence Management
- **Uploading**: Navigate to case detail page, upload files (max 10MB, JPEG/PNG/WebP/PDF/DOC/DOCX)
- **Viewing**: Evidence displayed on case detail page, filter by type

## Security Features

- **Input Validation & Sanitization**: All inputs sanitized, length limits enforced, type validation
- **Authentication Security**: bcryptjs password hashing, OAuth 2.0, NextAuth.js sessions, JWT
- **File Upload Security**: Filename sanitization, path traversal prevention, file type whitelist, size limits
- **Access Control**: Case ownership verification, team membership validation, proper HTTP status codes
- **Rate Limiting**: API endpoints protected, IP-based tracking
- **Error Handling**: Comprehensive try-catch, user-friendly messages, no sensitive info leaked

## Rules Engine

Evaluates properties against Catalonia's cédula de habitabilidad requirements (Decret 141/2012):
- Minimum useful area (36 m² for segunda ocupación)
- Minimum ceiling height (2.5m)
- Required facilities (kitchen, bathroom)
- Natural light and ventilation
- Occupancy density
- Heating system

Each rule returns: severity (pass/risk/fail/unknown), explanation, fix guidance, confidence (0-100%).

## Data Storage

File-based JSON storage in `/data/`:
- `cases.json`, `users.json`, `teams.json`, `team-members.json`, `templates.json`, `evidence.json`
- `evidence/` directory for uploaded files

Easily upgradeable to PostgreSQL, MongoDB, Supabase, or any other database.

## Pricing Structure

- **Free**: 1 report/month with watermark
- **Solo** (€49/mo): 60 reports/month, no watermark
- **Team** (€199/mo): 400 reports/month, team features

## Roadmap

### Phase 1 (MVP) - ✅ Complete
- Basic form and rules engine, PDF generation, share links, pricing page

### Phase 2 - ✅ Complete
- User authentication, team accounts, case pipeline, templates, evidence capture

### Phase 3 (Months 2-6)
- Multi-region support, municipality-specific overrides, integrations (Google Drive, Dropbox, CRM), rules admin panel, team UI components

### Phase 4 (Months 6-12)
- White-label reports, API for enterprise clients, analytics dashboard, partner channels, payment processing (Stripe)

## Development

```bash
npm run lint    # Linting
npm run build   # Build for production
```

## Contributing

This is an MVP. For production use, consider:
- Payment processing (Stripe)
- Real database upgrade
- Error tracking (Sentry)
- Comprehensive logging
- Unit and integration tests
- CI/CD pipeline

## License

MIT

## Disclaimer

This tool provides pre-validation only. It does not replace the official certification by a qualified technician. Always consult with a licensed professional for official cédula de habitabilidad certification.
