# B2B Admin UI Review Checklist

Review issues first, ordered by severity. Fix only the scoped issues needed for the task.

## Structure

- Information hierarchy is clear.
- Common workflows are visible without hunting.
- Information density supports repeated operations.
- Actions are grouped by frequency and risk.
- Primary, secondary, and destructive actions are visually distinct.

## Filters

- Common filters are immediately available.
- Advanced filters do not hide critical daily workflow controls.
- Defaults match the most common operational view.
- Filter chips, reset, and URL state are consistent.

## Tables

- Column order supports scanning and comparison.
- Status, owner, time, amount, and identifiers use consistent formats.
- Important columns can remain visible when horizontally scrolling.
- Row actions are predictable and do not shift layout.
- Bulk selection clearly communicates scope.

## Forms

- Validation appears near the field.
- Required fields and disabled fields are clear.
- Field dependencies are understandable.
- Submit, cancel, and dangerous actions are separated.
- Unsaved content warnings exist when data loss is possible.

## States

- Loading state preserves layout where possible.
- Empty state explains what happened and offers a useful next action.
- Error state gives recovery options.
- Forbidden state avoids leaking sensitive data.
- Partial success communicates which records failed and why.

## Accessibility And Interaction

- Keyboard operation works for high-frequency controls.
- Focus states are visible.
- Labels and control names are meaningful.
- Color is not the only status signal.
- Modals and drawers trap and restore focus correctly.

## Consistency

- Time, money, identifiers, and status labels use project formats.
- Confirmation language matches operation risk.
- Buttons, menus, tabs, and form controls match existing components.
- Layout is responsive without overlapping text or controls.

## Dangerous Operations

- Delete, disable, refund, permission change, export, and batch operations require suitable confirmation.
- Confirmation copy names the target and consequence.
- Recovery, rollback, or audit behavior is explicit for high-risk actions.
