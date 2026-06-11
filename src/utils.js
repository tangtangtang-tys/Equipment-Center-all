export function cls(...values) {
  return values.filter(Boolean).join(' ');
}

export function statusText(status) {
  return {
    normal: '正常',
    warning: '疑似异常',
    danger: '异常',
    muted: '未开通',
  }[status] ?? status;
}

export function statusTone(status) {
  return {
    normal: 'green',
    warning: 'amber',
    danger: 'red',
    muted: 'gray',
  }[status] ?? 'gray';
}

export function formatNumber(value) {
  return new Intl.NumberFormat('en-US').format(value);
}
