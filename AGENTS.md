<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Patel Networks (MegaTech) — AI Agent Operating Instructions

1. **Master Context & Handoff**:
   Always read [continue.md](file:///d:/work/megatech/patelnetworks/continue.md) and [compact.md](file:///d:/work/megatech/patelnetworks/compact.md) at the start of any conversation in Google AI Studio or any IDE.
2. **Continuous Documentation Maintenance**:
   With every code change, feature addition, or bugfix, you **MUST** continuously update:
   * `continue.md` (Update operational state, credentials reference, and completed milestones).
   * `changelog.md` (Append version release notes).
   * `decisions.md` (Record new Architectural Decision Records if applicable).
   * `compact.md`, `README.md`, `technical-dcoumentation.md`, `business-documentation.md`, `help.md`, and `review-test-followup.md`.
3. **Strict Code Standards**:
   * TypeScript Strict Mode (Zero `any` types).
   * Decimal/Paise financial calculations (Never use JavaScript floating point for prices or GST).
   * Concurrency-safe inventory operations inside Prisma interactive transactions.
   * Dual-mode architecture (Live integration + deterministic local simulation).
4. **Verification Protocol**:
   Before declaring any task done, run:
   * `npx tsc --noEmit`
   * `npx tsx scripts/comprehensive_loopback_test.ts`
   * `npx tsx scripts/master_loopback_test.ts`
