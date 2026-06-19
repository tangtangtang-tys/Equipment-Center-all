# Acceptance Checklist

## Functional Acceptance

- Main happy path works.
- Required fields and validation rules work.
- State transitions are correct.
- Batch operation behavior is defined.
- Partial success behavior is visible and actionable.

## Interaction Acceptance

- Filters, sorting, pagination, row actions, and batch actions work.
- URL state is shareable where expected.
- Loading, Empty, Error, Forbidden, and Partial Success states are covered.
- Dangerous operations use appropriate confirmation.
- Unsaved content warning appears where data loss is possible.

## Permission Acceptance

- Menu, route, page, button, field, and data-scope permissions are enforced.
- Backend authorization matches frontend affordances.
- Cross-tenant and cross-organization access is blocked.
- Direct URL and direct API calls are tested.

## Data Safety Acceptance

- Sensitive fields are masked where required.
- Import and export are scoped and audited.
- Idempotency is considered for write operations.
- Concurrent updates are handled or explicitly rejected.
- Rollback or recovery path is documented for high-risk operations.

## Performance Acceptance

- List pages avoid unnecessary rerenders.
- Large tables use pagination or virtualization when needed.
- Expensive computations are memoized where appropriate.
- Network requests avoid duplicate fetches.

## Accessibility Acceptance

- Keyboard navigation works for critical workflows.
- Focus states are visible.
- Modal and drawer focus behavior is correct.
- Form fields have accessible names.
- Status is not communicated by color alone.

## Automated Testing Acceptance

- Key paths have automated or documented manual verification.
- Failure and forbidden states are covered.
- Batch operation and pagination cases are covered where relevant.
- Tests use trusted project scripts only.

## Pre-Release Check

- No production database was touched.
- No secrets, tokens, or internal accounts were written to docs.
- No remote issues, labels, PRs, or releases were created without authorization.
- Git diff contains only expected files.
- Known limitations and remaining risks are documented.
