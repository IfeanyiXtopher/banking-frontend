export type PreviewPayload = {
  amount: string
  currency: string
  fee_total: string
  total_debit: string
  fees: { code: string; label: string; amount: string; is_rate?: boolean; line_kind?: string }[]
  exchange_rate: string
  credited_amount: string
  credited_currency: string
  destination: { account_type: string; last_four: string; account_number?: string }
  requires_otp?: boolean
  charge_upfront?: boolean
  fee_billing?: string
  requires_regulated_session?: boolean
  compliance_fee_total?: string
  base_transfer_fee?: string
}

export type SessionLine = {
  id: string
  sequence: number
  name: string
  code: string
  amount: string
  status: string
  payment_reference?: string
  customer_self_charge_allowed?: boolean
  customer_message?: string
  payment_instructions?: import('@/types/compliancePayment').CompliancePaymentInstructions
}
