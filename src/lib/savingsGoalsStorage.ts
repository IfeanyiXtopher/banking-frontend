export type SavingsGoalCategory = 'car' | 'house' | 'plane' | 'education' | 'gift' | 'other'

export interface SavingsGoalRules {
  roundUp: boolean
  weeklyRecurring: boolean
  weeklyAmount: number
  smartSave: boolean
}

export interface SavingsGoalMeta {
  targetAmount: number
  targetDate: string
  category: SavingsGoalCategory
  rules: SavingsGoalRules
}

const META_KEY = 'banking:savingsGoalMeta:v1'
const AUTO_SAVE_KEY = 'banking:autoSaveRules:v1'

export const DEFAULT_GOAL_RULES: SavingsGoalRules = {
  roundUp: true,
  weeklyRecurring: false,
  weeklyAmount: 0,
  smartSave: false,
}

export function loadAllGoalMeta(): Record<string, SavingsGoalMeta> {
  try {
    const raw = localStorage.getItem(META_KEY)
    if (!raw) return {}
    const parsed = JSON.parse(raw) as Record<string, SavingsGoalMeta>
    return parsed && typeof parsed === 'object' ? parsed : {}
  } catch {
    return {}
  }
}

export function getGoalMeta(accountId: string): SavingsGoalMeta | null {
  return loadAllGoalMeta()[accountId] ?? null
}

export function setGoalMeta(accountId: string, meta: SavingsGoalMeta): void {
  const all = loadAllGoalMeta()
  all[accountId] = meta
  localStorage.setItem(META_KEY, JSON.stringify(all))
}

export function removeGoalMeta(accountId: string): void {
  const all = loadAllGoalMeta()
  delete all[accountId]
  localStorage.setItem(META_KEY, JSON.stringify(all))
}

export interface AutoSaveRulesState {
  roundUps: boolean
  monthlyRecurring: boolean
  smartStash: boolean
}

const DEFAULT_AUTO_SAVE: AutoSaveRulesState = {
  roundUps: true,
  monthlyRecurring: true,
  smartStash: false,
}

export function loadAutoSaveRules(): AutoSaveRulesState {
  try {
    const raw = localStorage.getItem(AUTO_SAVE_KEY)
    if (!raw) return { ...DEFAULT_AUTO_SAVE }
    const parsed = JSON.parse(raw) as Partial<AutoSaveRulesState>
    return { ...DEFAULT_AUTO_SAVE, ...parsed }
  } catch {
    return { ...DEFAULT_AUTO_SAVE }
  }
}

export function saveAutoSaveRules(rules: AutoSaveRulesState): void {
  localStorage.setItem(AUTO_SAVE_KEY, JSON.stringify(rules))
}
