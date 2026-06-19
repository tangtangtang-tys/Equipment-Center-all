---
name: b2b-admin-orchestrator
description: Orchestrates requirements analysis, prototyping, B2B page specifications, React implementation, shadcn component usage, UX review, RBAC and data-safety review, and end-to-end testing for enterprise admin systems. Use whenever planning, building, reviewing, or testing a B2B admin feature.
---

# B2B Admin Orchestrator

Use this skill to route B2B admin work through only the skills and project references needed for the current task. Keep routing concise and prefer project conventions over generic advice.

## Priority

When instructions conflict, apply this order:

1. Explicit user requirements in the current task
2. Current project code, project docs, ADRs, API schemas, and design system
3. This skill and its references
4. Installed external general skills
5. General agent preferences

Never let an external skill override existing project standards.

## Start With Routing

At the start of each B2B admin task, output a short Skill route:

- Task type
- Skills to use
- Call order
- Skills not used
- Key risks

Usually choose only 1 to 3 required skills. Do not load every skill to appear thorough.

## References

Load these only when relevant:

- `references/workflow.md`: standard workflows by task type
- `references/page-spec.md`: page and interaction specification checklist
- `references/ui-review.md`: B2B admin UX review checklist
- `references/rbac-data-safety.md`: permissions, tenant isolation, and data safety checklist
- `references/acceptance-checklist.md`: delivery and release acceptance checklist

## Routing Rules

### Unclear Requirements Or Page Direction

Use:

1. `prototype`
2. `b2b-admin-orchestrator/references/page-spec.md`
3. `to-prd`

`prototype` is only for key uncertainty validation. Mark prototypes as temporary.

### Clear Requirements Needing A PRD

Use:

1. `to-prd`
2. `b2b-admin-orchestrator/references/page-spec.md`
3. `b2b-admin-orchestrator/references/rbac-data-safety.md`

Safety rules:

- Generate PRDs locally by default.
- Save PRDs to `docs/prd/` or a user-specified path by default.
- Do not create remote issues without explicit authorization.
- Do not add remote labels without explicit authorization.
- Do not publish to any task management system without explicit authorization.

### Admin List, Detail, Form, Or Settings Pages

Recommended order:

1. `b2b-admin-orchestrator/references/page-spec.md`
2. `shadcn` if the project uses shadcn/ui
3. `vercel-react-best-practices` for React or Next.js projects
4. `web-design-guidelines`

### Visual Design Direction

Use:

1. `prototype` UI branch
2. `frontend-design`
3. `b2b-admin-orchestrator/references/ui-review.md`

Limits:

- Prioritize information density for B2B admin.
- Prioritize frequent-operation efficiency.
- Prefer tables, filters, forms, and explicit action hierarchy.
- Do not default to marketing-page style.
- Do not default to oversized hero text, gradient backgrounds, decorative animation, or excessive card layouts.

### Database, Permissions, Or Multi-Tenant Work

Use:

1. `b2b-admin-orchestrator/references/rbac-data-safety.md`
2. `supabase` or `supabase-postgres-best-practices` when the stack uses them
3. `b2b-admin-orchestrator/references/acceptance-checklist.md`

Check tenant isolation, organization scope, role permissions, field permissions, backend authorization, RLS or equivalent data permissions, sensitive fields, audit logs, import/export, bulk operations, idempotency, concurrent updates, and rollback for dangerous operations.

### Page Experience Review

Use:

1. `web-design-guidelines`
2. `b2b-admin-orchestrator/references/ui-review.md`

Output issues first, then fix by priority. Do not perform broad visual rewrites without explaining scope.

### Complete Feature Delivery

Default flow:

1. Scan project context.
2. Identify user roles and business goals.
3. Run `prototype` only when key uncertainty exists.
4. Generate PRD and page spec.
5. Design state machine, APIs, permissions, and data boundaries.
6. Implement with existing project components.
7. Run React performance review.
8. Run UI and accessibility review.
9. Use `webapp-testing` for key-path verification.
10. Output acceptance report and remaining risks.

## Implementation Rules

1. Reuse existing project components first.
2. Do not introduce a new UI framework just to use a skill.
3. Do not initialize a new design system when one already exists.
4. Check existing components before adding shadcn components.
5. Prefer dry-run or diff before adding or updating components.
6. Do not operate on production databases.
7. Database changes must use the project's migration mechanism.
8. Hiding frontend buttons is not sufficient permission control.
9. Re-check critical permissions on the server.
10. Do not implement only the success state.
11. Cover Loading, Empty, Error, Forbidden, and Partial Success.
12. Define partial failure behavior for bulk operations.
13. Dangerous operations such as delete, void, refund, and permission changes need explicit confirmation.
14. High-risk operations should consider audit logs, idempotency, and undo capability.

## Definition Of Done

A B2B feature is complete only when:

- Requirements and scope are clear.
- Page fields and interactions are clear.
- State machine is complete.
- Permission boundaries are clear.
- Normal and exceptional states are complete.
- Implementation follows project technical standards.
- UI passes experience review.
- Key paths pass testing.
- There is no obvious cross-tenant access risk.
- Known limitations and remaining risks are documented.
