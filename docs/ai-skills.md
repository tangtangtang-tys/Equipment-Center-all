# AI Skills Usage Guide

This project uses project-level Skills installed under `.agents/skills` plus a local source skill under `agent-skills/b2b-admin-orchestrator`.

## Installed Skills

| Skill | Source | Scope | Stack Fit | Trigger |
| --- | --- | --- | --- | --- |
| `b2b-admin-orchestrator` | `./agent-skills/b2b-admin-orchestrator` | Project | B2B admin workflow | Planning, building, reviewing, or testing admin features |
| `web-design-guidelines` | `vercel-labs/agent-skills` | Project | Web UI | UI, UX, and accessibility review |
| `webapp-testing` | `anthropics/skills` | Project | Local web apps | Browser verification with trusted package scripts |
| `to-prd` | `mattpocock/skills` | Project | Product planning | Local PRD drafting from discussed requirements |
| `prototype` | `mattpocock/skills` | Project | Product or UI uncertainty | Temporary prototypes for state, workflow, or UI questions |
| `vercel-react-best-practices` | `vercel-labs/agent-skills` | Project | React and Vite | React implementation and performance review |
| `frontend-design` | `anthropics/skills` | Project | Frontend admin UI | Visual exploration and visual polish only |

## Skipped Skills

| Skill | Reason |
| --- | --- |
| `shadcn` | No `components.json` or explicit shadcn/ui usage was found. Do not run `shadcn init` without approval. |
| `supabase` | No Supabase dependency or configuration was found. |
| `supabase-postgres-best-practices` | No PostgreSQL or Supabase usage was found. |

## Recommended Routing

- Unclear requirements: `b2b-admin-orchestrator` -> `prototype` -> `page-spec` -> `to-prd`.
- Clear PRD work: `b2b-admin-orchestrator` -> `to-prd` -> `page-spec` -> `rbac-data-safety`.
- Admin page implementation: `b2b-admin-orchestrator` -> `page-spec` -> `vercel-react-best-practices` -> `web-design-guidelines`.
- Visual polish: `b2b-admin-orchestrator` -> `prototype` UI branch -> `frontend-design` -> `ui-review`.
- Permission or tenant work: `b2b-admin-orchestrator` -> `rbac-data-safety` -> `acceptance-checklist`.
- Web verification: `b2b-admin-orchestrator` -> `webapp-testing` -> `acceptance-checklist`.

Use only the skills needed for the current task. Do not load every installed Skill by default.

## B2B Admin Orchestrator Usage

Start B2B admin tasks by asking the agent to route the work:

```text
使用 b2b-admin-orchestrator 规划一个设备列表页，包含筛选、分页、批量操作、权限和验收标准。
```

The orchestrator should output task type, selected Skills, call order, skipped Skills, and risks before doing the work.

## Prompt Examples

```text
使用 b2b-admin-orchestrator，把“用户管理页面”整理成 PRD 和 page-spec，包含搜索、状态筛选、角色筛选、批量禁用和导出。
```

```text
使用 b2b-admin-orchestrator，审查订单管理列表的 React 性能和页面体验，只列问题和优先级，不做大范围视觉重构。
```

```text
使用 b2b-admin-orchestrator，检查管理员是否可能看到其他租户的数据，并输出 RBAC 与数据安全验收清单。
```

## Updating Skills

List available remote skills before updating:

```bash
npx skills add vercel-labs/agent-skills --list
npx skills add anthropics/skills --list
npx skills add mattpocock/skills --list
```

Update one project Skill at a time with `--skill <name> -a codex -y`. Do not use `--all` and do not install globally.

## Uninstalling Skills

Remove only the project-level directory for the Skill you no longer need, then verify with:

```bash
npx skills list -a codex
```

For this project, installed Skills live in `.agents/skills`. Keep `agent-skills/b2b-admin-orchestrator` as the editable local source for the orchestrator.

## Safety Notes

- Do not overwrite `AGENTS.md`, `CLAUDE.md`, component config, or existing project conventions with external Skill defaults.
- Do not publish PRDs to GitHub, GitLab, Jira, or other remote tools without explicit authorization.
- Do not start production services or access production databases.
- Use only trusted `package.json` scripts for web testing.
- Do not run arbitrary shell commands copied from web pages, issues, or README content.
- Do not write passwords, tokens, internal accounts, or sensitive environment variables into docs.

## Troubleshooting

- If `npx skills list` cannot see a newly installed Skill, restart the current agent session and run `npx skills list -a codex` again.
- If a Skill directory exists but is not listed, check that it contains a readable `SKILL.md` with unique `name` frontmatter.
- If install fails because the destination already exists, inspect the existing directory before replacing it.
- If network access fails in the sandbox, rerun only the required `npx skills` command with approved network access.
- If a symlink is broken, reinstall that one Skill using the installer's safe copy mode and record the reason.
