export function initials(firstName = '', lastName = '') {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.trim().toUpperCase() || '?'
}

export function displayName(contact) {
  return [contact?.firstName, contact?.lastName].filter(Boolean).join(' ') || 'Unnamed contact'
}

export function primaryValue(items = [], key) {
  return items.find((item) => item.primary)?.[key] ?? items[0]?.[key] ?? ''
}

export function todayLabel() {
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  }).format(new Date())
}
