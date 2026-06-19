# RBAC And Data Safety Checklist

Use this for permissions, tenant isolation, imports, exports, batch operations, and database-sensitive changes.

## Permission Surfaces

- Menu permission
- Route permission
- Page permission
- Button permission
- Field permission
- Data scope permission
- Import permission
- Export permission
- Batch operation permission

## Isolation

- Tenant isolation
- Organization isolation
- Department or team scope
- Row-level permission
- Ownership constraints
- Cross-tenant query prevention
- ID enumeration prevention

## Backend Enforcement

- Server-side authorization
- API-level permission checks
- RLS or equivalent data permission
- Sensitive field masking
- Permission error shape
- Audit log coverage

## Dangerous Operations

- Explicit confirmation
- Idempotency
- Optimistic lock or concurrency control
- Rollback or undo path
- Partial failure handling
- Retry safety

## Data Movement

- Import validation
- Export scope validation
- Export sensitive field masking
- Download audit trace
- Bulk operation result detail

## Abuse And Regression Cases

- User changes URL IDs manually.
- User replays old requests.
- User changes tenant or organization IDs in request payload.
- User calls hidden actions directly.
- User exports data outside assigned scope.
- User performs a batch action containing mixed-permission records.

## Review Output

For every issue, record:

- Risk
- Affected roles
- Affected data scope
- Required server-side check
- Required UI behavior
- Test case
