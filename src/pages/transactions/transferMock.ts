/**
 * Client-only mock data for the transfer UI (international wire + fees + compliance).
 * Set `TRANSFER_UI_MOCK` to `false` to use real preview, OTP, compliance, and transfer APIs.
 */
import type { PreviewPayload, SessionLine } from './transferTypes'
import type { TransferCurrency } from './internationalTransfer'
import { mockIndicativeExchangeRate } from './internationalTransfer'
import { normalizeDestinationAccountNumber } from './transferValidation'

export type { PreviewPayload, SessionLine }

export const TRANSFER_UI_MOCK = false

export const MOCK_TRANSFER_OTP = '123456'
export const MOCK_COMPLIANCE_OTP = '654321'

export const MOCK_REG_SESSION_ID = '00000000-0000-4000-8000-000000000001'

export const MOCK_ACCOUNTS = [
  {
    id: 'mock-acc-checking',
    account_number: '1000000001',
    account_type: 'CHECKING',
    balance: '8420.00',
  },
  {
    id: 'mock-acc-savings',
    account_number: '2000000002',
    account_type: 'SAVINGS',
    balance: '3100.50',
  },
] as const

const MOCK_COMPLIANCE_LINES_TEMPLATE: Omit<SessionLine, 'status'>[] = [
  {
    id: 'mock-line-aml',
    sequence: 0,
    name: 'AML / sanctions screening',
    code: 'aml_screening',
    amount: '25.00',
  },
  {
    id: 'mock-line-filing',
    sequence: 1,
    name: 'Cross-border regulatory filing',
    code: 'reg_filing',
    amount: '12.50',
  },
]

export function createInitialMockComplianceLines(): SessionLine[] {
  return MOCK_COMPLIANCE_LINES_TEMPLATE.map((l) => ({ ...l, status: 'PENDING' }))
}

function round2(n: number): string {
  return (Math.round(n * 100) / 100).toFixed(2)
}

export function buildMockTransferPreview(params: {
  amount: string
  transfer_type: string
  to_account_id: string
  transfer_currency?: TransferCurrency
  delivery_method?: string
}): PreviewPayload {
  const principal = Math.max(0, parseFloat(params.amount) || 0)
  const lastFour =
    params.to_account_id.replace(/\D/g, '').slice(-4).padStart(4, '0') || '0000'
  const sendCcy = params.transfer_currency ?? 'USD'
  const creditCcy = sendCcy === 'USD' ? 'EUR' : sendCcy === 'EUR' ? 'USD' : 'EUR'
  const fxRate = mockIndicativeExchangeRate(sendCcy, creditCcy)

  if (params.transfer_type === 'TRANSFER_INTERNATIONAL') {
    const intlFee = 18
    const credited = principal * fxRate
    const complianceTotal = 25 + 12.5
    const totalDebit = principal + intlFee

    return {
      amount: params.amount,
      currency: sendCcy,
      fee_total: String(intlFee),
      total_debit: round2(totalDebit),
      fees: [
        {
          code: 'FX',
          label: `Indicative rate (${sendCcy} → ${creditCcy})`,
          amount: String(fxRate),
          is_rate: true,
        },
        {
          code: 'INTL',
          label: 'SWIFT transfer fee',
          amount: round2(intlFee),
        },
        {
          code: 'aml_screening',
          label: 'AML / sanctions screening',
          amount: '25.00',
          line_kind: 'compliance',
        },
        {
          code: 'reg_filing',
          label: 'Cross-border regulatory filing',
          amount: '12.50',
          line_kind: 'compliance',
        },
      ],
      exchange_rate: String(fxRate),
      credited_amount: round2(credited),
      credited_currency: creditCcy,
      destination: { account_type: 'SAVINGS', last_four: lastFour },
      requires_otp: true,
      charge_upfront: true,
      fee_billing: 'sender_pays',
      requires_regulated_session: true,
      compliance_fee_total: round2(complianceTotal),
      base_transfer_fee: round2(intlFee),
    }
  }

  if (params.transfer_type === 'TRANSFER_EXTERNAL') {
    const fee = 5
    const totalDebit = principal + fee
    return {
      amount: params.amount,
      currency: 'USD',
      fee_total: round2(fee),
      total_debit: round2(totalDebit),
      fees: [{ code: 'EXT', label: 'External transfer fee', amount: round2(fee) }],
      exchange_rate: '1',
      credited_amount: round2(principal),
      credited_currency: 'USD',
      destination: {
        account_type: 'EXTERNAL',
        last_four: lastFour,
        account_number: normalizeDestinationAccountNumber(params.to_account_id),
      },
      requires_otp: true,
      charge_upfront: true,
      requires_regulated_session: false,
    }
  }

  const fee = 0
  return {
    amount: params.amount,
    currency: 'USD',
    fee_total: round2(fee),
    total_debit: round2(principal + fee),
    fees: [],
    exchange_rate: '1',
    credited_amount: round2(principal),
    credited_currency: 'USD',
    destination: { account_type: 'CHECKING', last_four: lastFour },
    requires_otp: false,
    charge_upfront: true,
    requires_regulated_session: false,
  }
}

/** SafaPay Bank account credited for international wires when “To account” is not shown. */
/** Fallback credited account for intl UI when “To account” is hidden (must exist in backend for submit). */
export const INTERNATIONAL_DEFAULT_TO_ACCOUNT = '8230343052496520'

export function effectiveToAccountId(transferType: string, toAccountId?: string): string {
  const trimmed = toAccountId?.trim() ?? ''
  if (transferType === 'TRANSFER_INTERNATIONAL') {
    return trimmed || INTERNATIONAL_DEFAULT_TO_ACCOUNT
  }
  return normalizeDestinationAccountNumber(trimmed)
}

/** Pre-filled sample for SWIFT demo (use “Fill sample” on transfer page). */
export const SAMPLE_INTERNATIONAL_WIRE = {
  to_account_id: INTERNATIONAL_DEFAULT_TO_ACCOUNT,
  amount: '250.00',
  description: 'Invoice 2026-04 / design services',
  delivery_method: 'SWIFT' as const,
  transfer_currency: 'USD' as const,
  beneficiary_type: 'INDIVIDUAL' as const,
  account_number_type: 'IBAN' as const,
  beneficiary_email: '',
  save_beneficiary: true,
  beneficiary_legal_name: 'Helena Costa da Silva',
  beneficiary_address_line1: 'Rua das Flores 42, 2º Esq.',
  beneficiary_address_line2: 'Moradia Azul',
  beneficiary_city: 'Porto',
  beneficiary_region_state: '13',
  beneficiary_postal_code: '4050-262',
  beneficiary_country: 'PT',
  beneficiary_bank_name: 'Banco Comercial Português, S.A.',
  beneficiary_bank_address_line1: 'Praça D. João I, 47',
  beneficiary_bank_address_line2: '',
  beneficiary_bank_city: 'Porto',
  beneficiary_bank_country: 'PT',
  beneficiary_bic_swift: 'BCOMPTPL',
  beneficiary_iban: 'PT50 0002 0123 12345678901 54',
  beneficiary_account_number: '',
  beneficiary_sort_code: '',
  beneficiary_routing_number: '',
  purpose_of_payment: 'Professional services per agreement dated 2026-03-01',
  remittance_reference: 'INV-2026-118',
  charges_option: 'SHA' as const,
  intermediary_bank_bic: 'DEUTDEFF',
  intermediary_bank_name: 'Deutsche Bank AG (correspondent)',
  instructions_to_beneficiary_bank: 'Credit value date: same day if before 14:00 CET',
} as const
