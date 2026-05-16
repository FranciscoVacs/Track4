# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
pnpm dev       # Start development server (http://localhost:3000)
pnpm build     # Production build
pnpm start     # Run production server
pnpm lint      # ESLint
```

Package manager is **pnpm**. Use `pnpm add` / `pnpm remove` for dependencies.

## Architecture

**LV Quality Vision – Línea 03** is a Next.js 16 (App Router) visual inspection dashboard for detecting defects in food production line packaging. All data is currently mocked.

### Stack

- Next.js 16 + React 19, App Router, server actions
- Tailwind CSS v4 with LV brand CSS variables (defined in `styles/globals.css`)
- shadcn/ui component library (59 components in `components/ui/`) — style: "new-york"
- Framer Motion (micro-interactions) + GSAP (scanline animation in `InspectionPanel`)
- Recharts for data visualization
- React Hook Form + Zod for forms

### LV Brand Colors (CSS variables)

| Token | Value |
|---|---|
| `--lv-navy` | `#242E8F` |
| `--lv-yellow` | `#F6D300` |
| `--lv-orange` | `#F58220` |
| `--lv-red` | `#E52421` |
| `--lv-cyan` | `#11A5D6` |
| `--lv-light-bg` | `#F7F7F4` |

### Feature Components (`components/`)

| Component | Purpose |
|---|---|
| `TopNav` | Header — live status, model version, operator avatar |
| `HeroKpis` | Animated KPI counters (units, defects, accuracy, pending) |
| `InspectionPanel` | Core AI inspection UI — empty / analyzing / result states with bounding box overlay |
| `CategoriesRail` | Sidebar defect category list with per-category counts |
| `RosterGrid` | Filterable grid of inspection records (flagged / pending / approved) |
| `RosterCard` | Individual inspection card — thumbnail, timestamp, camera |
| `ReviewDrawer` | Slide-out operator review panel with AI suggestion + action buttons |
| `StatusStrip` | Bottom bar with live connection indicator |

Page layout order in `app/page.tsx`: HeroKpis → InspectionPanel + CategoriesRail → RosterGrid → ReviewDrawer → StatusStrip.

### Data & Types (`lib/`)

- `lib/types.ts` — core types: `DefectColor`, `DefectCategory`, `RosterItem`, `RosterStatus`, `Bbox`, `InspectionResult`
- `lib/mock-data.ts` — all sample data (defect categories, inspection results, roster items, color hex map)
- `lib/utils.ts` — `cn()` helper (clsx + tailwind-merge)

### Key Conventions

- All feature components are `'use client'` — no RSC data fetching yet
- State is local (`useState`); no global state library
- Styling is utility-first Tailwind; custom classes (`.lv-card`, `.lv-pattern-bg`, `.uppercase-label`) are defined in `globals.css`
- `@/*` path alias resolves to the project root
- TypeScript strict mode is on; build ignores TS errors (`ignoreBuildErrors: true` in `next.config.mjs`)
