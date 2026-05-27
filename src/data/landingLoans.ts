import {
  getLoanTypeVisual,
  LOAN_CATALOG_LIMITS,
  LOAN_TYPE_DISPLAY_NAMES,
  LOAN_TYPE_ORDER,
  type LoanCatalogType,
} from '@/lib/loanProductVisuals'
import { formatDisplayCurrency } from '@/utils/format'

export type LandingLoanType = {
  id: LoanCatalogType
  name: string
  image: string
  tagline: string
  insight: string
  bestFor: string[]
  amountLabel: string
  termLabel: string
}

const INSIGHTS: Record<LoanCatalogType, { insight: string; bestFor: string[] }> = {
  PERSONAL: {
    insight:
      'A personal loan gives you one clear number: how much you borrow, your rate, and when the balance will be zero. That predictability makes it a strong choice when revolving credit would keep costs fuzzy. Use it to consolidate higher-rate balances, bridge a short gap between jobs, or fund a renovation with a defined budget — not open-ended spending.',
    bestFor: ['Debt consolidation', 'Medical or relocation costs', 'One-off projects with a fixed budget'],
  },
  MORTGAGE: {
    insight:
      'Homes are usually the largest purchase you will make. Spreading repayment over many years keeps monthly housing costs manageable while you build equity. We walk you through fixed vs variable structures, insurance requirements, and every fee before completion so there are no surprises at the solicitor’s desk.',
    bestFor: ['First home purchase', 'Remortgaging for a better rate', 'Buy-to-let with clear rental assumptions'],
  },
  AUTO: {
    insight:
      'Because the vehicle secures the loan, auto finance often costs less per month than unsecured credit for the same car price. Terms are matched to the vehicle’s age and mileage, and funds can be sent directly to a dealer after approval — so you collect keys knowing the paperwork is done.',
    bestFor: ['New or used cars from dealers', 'Private sales after inspection', 'Replacing an older vehicle with lower running costs'],
  },
  BUSINESS: {
    insight:
      'Trading businesses rarely have perfectly smooth cash flow. A term loan can fund stock, equipment, or a new location while repayments stay on a schedule you can model in forecasts. We review trading history and purpose of funds; larger facilities may include security or director guarantees explained upfront.',
    bestFor: ['Working capital through seasonal dips', 'Equipment or fleet upgrades', 'Expansion without giving up equity'],
  },
  EDUCATION: {
    insight:
      'Education is an investment with a long payoff horizon. Spreading tuition and living costs over structured repayments — sometimes with a grace period after graduation — lets students and families focus on study instead of upfront fees. Disbursement can go straight to the institution, reducing admin for everyone.',
    bestFor: ['University or college tuition', 'Professional certifications', 'Study abroad with documented fees'],
  },
}

function formatAmountRange(type: LoanCatalogType): string {
  const { min_amount, max_amount } = LOAN_CATALOG_LIMITS[type]
  return `${formatDisplayCurrency(min_amount)} – ${formatDisplayCurrency(max_amount)}`
}

function formatTermRange(type: LoanCatalogType): string {
  const { min_term_months, max_term_months } = LOAN_CATALOG_LIMITS[type]
  const years = (m: number) => (m >= 12 ? `${Math.round(m / 12)} yr` : `${m} mo`)
  if (max_term_months >= 12 && min_term_months >= 12) {
    return `${years(min_term_months)} – ${years(max_term_months)}`
  }
  return `${min_term_months} – ${max_term_months} months`
}

export const LANDING_LOAN_TYPES: LandingLoanType[] = LOAN_TYPE_ORDER.map((id) => {
  const visual = getLoanTypeVisual(id)
  const extra = INSIGHTS[id]
  return {
    id,
    name: LOAN_TYPE_DISPLAY_NAMES[id],
    image: visual.heroImage,
    tagline: visual.tagline,
    insight: extra.insight,
    bestFor: extra.bestFor,
    amountLabel: formatAmountRange(id),
    termLabel: formatTermRange(id),
  }
})
