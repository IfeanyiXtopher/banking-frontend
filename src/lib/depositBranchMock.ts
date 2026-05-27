/**
 * Cash deposit branch locations (mock).
 * Sourced from branch posting data — branches with hours_since_last_post >= 24.
 */
export type CashDepositBranch = {
  id: string
  name: string
  hoursSinceLastPost: number
}

/** Branches at 24+ hours since last device post (from provided branch posting export). */
export const CASH_DEPOSIT_BRANCHES_24H_PLUS: CashDepositBranch[] = [
  { id: '241', name: 'Access Akanran', hoursSinceLastPost: 999 },
  { id: '93', name: 'Access Main Ajose', hoursSinceLastPost: 4033 },
  { id: '257', name: 'CaringHabitat', hoursSinceLastPost: 67 },
  { id: '83', name: 'CR_Ilupeju', hoursSinceLastPost: 234 },
  { id: '94', name: 'Eco Bank MFM Branch', hoursSinceLastPost: 4033 },
  { id: '75', name: 'Landmark Tower', hoursSinceLastPost: 4033 },
  { id: '251', name: 'Ogunsanya', hoursSinceLastPost: 999 },
  { id: '47', name: 'Polaris Head Office', hoursSinceLastPost: 745 },
  { id: '54', name: 'Polaris Magodo', hoursSinceLastPost: 4033 },
  { id: '78', name: 'Romays Garden', hoursSinceLastPost: 4033 },
  { id: '249', name: 'Teme_Oniru', hoursSinceLastPost: 999 },
  { id: '237', name: 'Test Branch', hoursSinceLastPost: 999 },
  { id: '229', name: 'The Beach house', hoursSinceLastPost: 999 },
  { id: '86', name: 'UB-Ogba Branch', hoursSinceLastPost: 4033 },
]

export function cashDepositBranchOptions(): { value: string; label: string }[] {
  return CASH_DEPOSIT_BRANCHES_24H_PLUS.map((b) => ({
    value: b.name,
    label: `${b.name} · ${b.hoursSinceLastPost}h`,
  }))
}
