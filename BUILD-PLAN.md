# FEAT — Admin Portal & Backend Build Plan

## Scope note — demo-first

The admin portal is for **you and demos**, not clients self-serving. That means:

- Only one admin account matters for now: yours.
- No org switching, no client logins, no billing.
- But the database is built as if those exist — an `org_id` column sits on every relevant table with a default "FEAT demo org". When you're ready to onboard real clients, you add a signup flow and row-level security, not a schema rewrite.
- Priority goes to the things that **look impressive in a demo**: authoring a test on-screen, reviewing a rich result, running a candidate through a polished flow.
- Multi-tenant, white-labelling, bulk invites, client self-service → all deferred.

---

## Who does what (simplified)

**You (super admin)** — log in, build tests, assign them to demo candidates, review results. Full access to everything.

**Candidate** — signs in via magic link, sees their assigned tests, takes them, sees results if you've released them. This one needs to feel real because prospects watch it.

A second admin tier (client admin) exists in the schema but has no UI yet.

---

## What the backend stores

Same tables as before — just not all of them need to be built immediately.

**Build now (phase 0–2):**

- **organisations** — one row, "FEAT demo" to start
- **users** — you + demo candidates, with a `role` field (`super_admin` | `candidate`, with `org_admin` reserved for later)
- **tasks** — test definitions (replaces the in-code `scenario-tasks-data.ts`)
- **task_versions** — every edit creates a new version so old assignments don't break
- **task_screens** — the ordered screens inside a version
- **assignments** — who got which test, status, deadline
- **attempts** — one per time a candidate starts a task
- **responses** — per-screen answers
- **reports** — scored output

**Build later (phase 3+):**

- **reviews** — human validation overrides
- **memberships** — only needed once real orgs exist
- **audit_log** — nice to have, not urgent

---

## The four capabilities — demo lens

### 1. Assigning tests
For your demo, this just needs to work — it's plumbing, not theatre.

- `/admin/assign` — pick a task, paste an email, optional deadline, send.
- Candidate gets a magic-link email ("Click here to take your assessment").
- `/admin/assignments` — simple table, status chips, click to inspect.

Don't overbuild. No bulk CSV import yet. No reminders. No scheduling.

### 2. Viewing tests
This is where you show off the **depth** of the scoring. Spend design effort here.

- `/admin/attempts` — filterable list of everything candidates have done.
- `/admin/attempts/[id]` — the full story: every answer, every justification, per-dimension bands, scoring hints met/missed. Make it look like a proper report, not a debug dump.
- Export-to-PDF button for the sales conversation ("here's what you'd send a hiring manager").

### 3. Validating / checking quality
Defer the rich review UI until phase 3. For demos in the meantime:

- Stub: every attempt is "auto-released" on submission. Candidate sees results immediately.
- Add a flag on the attempt view: `needs_review` boolean, so you can mark anything suspicious during a demo.

The full review workflow (queue, per-dimension overrides, approve/release gate) comes once the basic flow is solid.

### 4. Building custom tests — the demo centrepiece
This is the feature that sells the product. Make it feel like a craftsman's tool, not a form.

**Layout**

```
┌─────────────────┬─────────────────────────────┐
│  Screen list    │  Screen editor              │
│  (drag to       │  (fields for the selected   │
│   reorder,      │   screen type)              │
│   + Add screen) │                             │
│                 │                             │
├─────────────────┴─────────────────────────────┤
│  Live preview panel (toggle on/off)           │
└───────────────────────────────────────────────┘
```

**The authoring flow, simple version**

1. **Task basics** — name, category badge text, accent colour (hex or picker), one-line subtitle.
2. **Learning objective** — one sentence in a text field.
3. **Performance criteria** — five text fields (enforce exactly 5 for visual consistency).
4. **Scoring dimensions** — repeatable rows (3–5 of them), each with a name + description.
5. **Screens** — add-screen menu pops the eight kinds (briefing auto-made from 1–4). For each, show a form matching that kind's shape. Directly mirrors the current TypeScript types, so the data maps 1:1 into `ScenarioTask`.
6. **Preview** — button runs the task in a side panel or full-screen. Same `ScenarioTask` component you already ship.
7. **Save draft** / **Publish** — publishing creates a new immutable version.

**Why this works for demos**
You can sit with a prospect, say "what's the scenario you wish you could assess?", and build their exact task live. That's a sales moment nothing else in the language-testing market has.

---

## Tech choices (unchanged)

- **Supabase Auth** — magic-link for candidates, password for you.
- **Supabase Postgres** — tables above.
- **Supabase RLS** — set up now, even with one org. Future-proofing and the syntax is the same.
- **Next.js App Router** — add `/admin` route group with its own layout + auth guard.
- **Rich text** — plain textareas everywhere for now. Don't pull in TipTap until someone asks.

---

## Build phases (revised for demo-first)

**Phase 0 — Foundations (1 week)**
Supabase tables for organisations, users, tasks, task_versions, task_screens, assignments, attempts, responses, reports. One org row ("FEAT demo"). You as the first super admin. Auth wired, `/admin` gated behind it. Migrate the current hardcoded tasks into the database.

**Phase 1 — The candidate experience (1 week)**
Magic-link signup + login. Candidate dashboard at `/dashboard` showing assigned tests. Starting a test loads from the DB instead of the hardcoded file. Responses + report save to the DB on submit. Result page reads from the DB.

**Phase 2 — Admin view + basic assign (4–5 days)**
`/admin/assign` form (one candidate at a time). `/admin/assignments` list. `/admin/attempts/[id]` detail page that shows every response and the full scored report. This is enough to demo end-to-end.

**Phase 3 — Authoring tool (3–4 weeks — the big one)**
Task library page. Create/edit flow with the screen builder UI described above. Live preview. Versioning on publish. This is the phase worth investing in.

**Phase 4 — Validation UI (1–2 weeks)**
Review queue, per-dimension overrides, release gate. Only needed once you've got real candidates and real stakes — fine to stay stubbed through early demos.

**Phase 5 — Multi-tenant flip (2–3 weeks, when the first real client signs)**
Turn on RLS properly, add org admin role, add signup/org-creation flow, add org-level theming. Because the schema already has `org_id` everywhere, this is a UI build, not a data migration.

---

## What I'd build first, concretely

To get a demo-ready system in ~2 weeks:

1. **Schema**: run a migration that creates the phase-0/1 tables in Supabase.
2. **Seed**: insert the existing 5 Professional tasks as rows in `tasks` / `task_versions` / `task_screens`.
3. **Auth**: wire Supabase Auth. Protect `/admin/*`. Add a simple `/login`.
4. **Candidate side**: make the existing `ScenarioTask` component read a task by ID from the DB, and save responses + report to `attempts` / `responses` / `reports` on submit.
5. **Admin side (minimum viable)**: `/admin/assign` form, `/admin/attempts` list, `/admin/attempts/[id]` detail.

After that you can demo the full loop: build a candidate, assign a test, have them take it, walk through the result on-screen. The authoring tool (the real showstopper) comes next.

---

## Open questions to decide soon

- **Result release** — in phase 1–2, results show immediately on submit. When you demo to a prospect who asks about moderation, is "humans can review before release" something you want to mention as roadmap, or stay silent until phase 4 is built?
- **Task library visibility** — are the 5 existing Professional tasks visible to all future orgs as a "FEAT master library", or does every org start empty and build their own? (Recommend: master library, shared.)
- **Candidate data portability** — if a candidate takes an OJT test for you, and a real client later onboards, do they take it again, or does the old result carry across? (Recommend: new attempt each time. Simpler.)
- **Demo data** — should I script a couple of realistic "demo candidates" with completed attempts on each task, so you always have something to show even with a fresh database?
