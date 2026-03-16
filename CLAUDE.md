# TMC Info Centre — Claude Context

## App Overview
**App name:** TMC Info Centre
**Purpose:** Staff ask questions in plain English, the app generates T-SQL, runs it against our Microsoft Fabric silver layer (medallion architecture: bronze/silver/gold), and returns answers in natural language.

## Business Context
The Mole Clinic (TMC) is a private dermatology business with ~8 clinics currently, expanding to 30+. This tool is for internal staff (clinic managers, ops team, leadership) to query business data without needing SQL knowledge.

## Tech Stack
- **Frontend:** Next.js 15, React 19, Tailwind CSS, TypeScript
- **Router:** Next.js App Router
- **Backend:** Next.js API routes
- **AI:** Anthropic Claude API (claude-sonnet-4-6) for NL→SQL and SQL→natural language summary
- **Database:** Microsoft Fabric SQL endpoint (silver layer)
- **Auth:** Microsoft Entra ID (Azure AD) SSO — staff only

## Architecture Flow
User question → `/app/api/query/route.ts` → `sql-generator.ts` (Claude API: NL→SQL) → `fabric.ts` (execute SQL) → Claude API (summarise results) → Response

## Silver Layer Tables
| Table | Description |
|-------|-------------|
| `fact_appointments` | All appointments: date, clinic, practitioner, service, status (attended/cancelled/no-show) |
| `fact_invoices` | All invoices: date, clinic, amount, service, patient |
| `dim_clinics` | Clinic lookup: id, name, city, region, open_date |
| `dim_practitioners` | Practitioner lookup: id, name, role, clinic_id |
| `dim_patients` | Patient lookup: id, age_band, referral_source |
| `dim_services` | Service lookup: id, name, category, price |

## Clinic Locations
Wilmslow, London Harley St, London City, Birmingham, Manchester, Leeds, Bristol, Edinburgh

## Design System
- **Primary colour:** `#1a6b5a` (teal green)
- **Font:** DM Sans (Google Fonts)
- **Style:** Clean, professional, card-based chat UI
- **User messages:** Dark bubble (teal/dark)
- **Assistant messages:** White cards with shadow
- **SQL blocks:** Expandable, monospace, dark background
- **Data tables:** Striped, compact, scrollable

## Key Files
- `/app/api/query/route.ts` — Main API handler (NL→SQL→execute→summarise)
- `/app/page.tsx` — Chat interface
- `/lib/fabric.ts` — Fabric SQL connection helper
- `/lib/sql-generator.ts` — Claude API NL→SQL integration
- `/lib/schema.ts` — Silver layer table schemas for LLM context

## Environment Variables
See `.env.example` for required variables.

## Development Notes
- Mock data is included for development — see `lib/mock-data.ts`
- Fabric connection is stubbed in `lib/fabric.ts`; replace with real mssql connection
- The SQL generator includes the full schema as system context to guide Claude
- Loading states cycle: "Interpreting your question..." → "Generating SQL..." → "Running against Fabric..." → "Composing response..."
