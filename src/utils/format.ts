import { format, formatDistanceToNow } from 'date-fns'

/** Customer-facing UI: show all amounts as USD ($). Numeric values are unchanged (no FX conversion). */
export const DISPLAY_CURRENCY_CODE = 'USD'
export const DISPLAY_CURRENCY_SYMBOL = '$'

export function formatDisplayCurrency(amount: number | string): string {
  return formatCurrency(amount, DISPLAY_CURRENCY_CODE, DISPLAY_CURRENCY_SYMBOL)
}

/** Transaction-style signed amount, e.g. +$1.00 / −$1.00 */
export function formatDisplayAmount(amount: number | string, isCredit: boolean): string {
  return formatAmount(amount, isCredit, DISPLAY_CURRENCY_SYMBOL)
}

export function formatCurrency(amount: number | string, _currency = 'USD', symbol = '$'): string {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount
  if (isNaN(num)) return `${symbol}0.00`
  return `${symbol}${Math.abs(num).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

export function formatAmount(amount: number | string, isCredit: boolean, symbol = '$'): string {
  const formatted = formatCurrency(amount, undefined, symbol)
  return isCredit ? `+${formatted}` : `-${formatted}`
}

export function formatDate(dateStr: string, fmt = 'MMM dd, yyyy'): string {
  try {
    return format(new Date(dateStr), fmt)
  } catch {
    return dateStr
  }
}

export function formatRelativeTime(dateStr: string): string {
  try {
    return formatDistanceToNow(new Date(dateStr), { addSuffix: true })
  } catch {
    return dateStr
  }
}

export function formatAccountNumber(number: string): string {
  return number.replace(/(.{4})/g, '$1 ').trim()
}

export function maskAccountNumber(number: string): string {
  if (number.length <= 4) return number
  return '•••• '.repeat(Math.floor((number.length - 4) / 4)) + number.slice(-4)
}

export function formatPercentage(value: number | string, decimals = 2): string {
  const num = typeof value === 'string' ? parseFloat(value) : value
  return `${(num * 100).toFixed(decimals)}%`
}
