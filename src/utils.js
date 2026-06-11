export function cls(...values) {
  return values.filter(Boolean).join(' ');
}

export function formatNumber(value) {
  return new Intl.NumberFormat('en-US').format(value);
}
