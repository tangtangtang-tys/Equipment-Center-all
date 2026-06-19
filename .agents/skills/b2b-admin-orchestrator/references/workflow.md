# B2B Admin Workflows

## Small Change Workflow

- Applies when: copy, style, validation, or small interaction changes with clear scope.
- Skills: `b2b-admin-orchestrator`, optional `web-design-guidelines`, optional `vercel-react-best-practices`.
- Order: scan context -> change narrowly -> review affected states -> run relevant script.
- Input: user request, affected files, existing component pattern.
- Output: focused diff and verification note.
- Done when: no unrelated files changed, affected state is checked, and relevant command passes or is reported.

## New Page Workflow

- Applies when: adding list, detail, form, settings, or dashboard pages.
- Skills: `page-spec`, optional `shadcn`, `vercel-react-best-practices`, `web-design-guidelines`.
- Order: page spec -> component inventory -> implementation -> performance review -> UX review -> test.
- Input: roles, business goal, fields, APIs, permissions, routes.
- Output: page implementation, state handling, acceptance notes.
- Done when: Loading, Empty, Error, Forbidden, and normal states are handled.

## Complete Business Feature Workflow

- Applies when: feature spans pages, APIs, permissions, or data model changes.
- Skills: `prototype` when uncertain, `to-prd`, `page-spec`, `rbac-data-safety`, `webapp-testing`.
- Order: scan -> clarify roles -> prototype if needed -> PRD -> page/API/permission spec -> implementation -> review -> tests.
- Input: business process, actors, data scope, state transitions.
- Output: PRD, page spec, implementation, verification report.
- Done when: requirements, state machine, permissions, UI, and key tests are complete.

## Permission Refactor Workflow

- Applies when: menu, route, page, button, field, tenant, organization, or row-level permissions change.
- Skills: `rbac-data-safety`, optional `supabase-postgres-best-practices`, `acceptance-checklist`.
- Order: current permission model -> threat cases -> backend checks -> UI affordances -> regression tests.
- Input: roles, permission matrix, data ownership, sensitive fields.
- Output: permission design, implementation notes, risk list.
- Done when: server-side enforcement and cross-tenant checks are verified.

## UI Review Workflow

- Applies when: reviewing or polishing admin pages.
- Skills: `web-design-guidelines`, `ui-review`, optional `frontend-design`.
- Order: issue list -> severity -> scoped fixes -> responsive and accessibility check.
- Input: page URL or files, target users, workflows.
- Output: prioritized findings and focused fixes.
- Done when: scanning, density, action hierarchy, states, and accessibility pass review.

## Bug Fix Workflow

- Applies when: a reported behavior is broken or inconsistent.
- Skills: optional `webapp-testing`, optional `vercel-react-best-practices`, relevant reference checklist.
- Order: reproduce -> isolate cause -> fix minimally -> regression test -> report risk.
- Input: repro steps, expected result, actual result.
- Output: fix, verification, remaining risk.
- Done when: bug is reproduced or reasonably simulated and the fix is verified.
