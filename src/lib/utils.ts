export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ')
}

export function formatPrice(amount: number, currency = 'MYR'): string {
  // TODO: Implement proper price formatting.
  return `${currency} ${amount.toFixed(2)}`
}

export function formatDate(date: string | Date): string {
  // TODO: Implement proper date formatting.
  return new Date(date).toLocaleDateString()
}
