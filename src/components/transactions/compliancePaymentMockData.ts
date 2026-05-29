/** Mock data for compliance fee payment UI — replace with API later. */

export type CompliancePaymentMethodOption = 'crypto' | 'wire'

export type AdminPaymentAvailability = CompliancePaymentMethodOption | 'both'

export type CryptoAssetId = 'btc' | 'usdt' | 'eth'

export type UsdtNetworkId = 'erc20' | 'trc20' | 'bep20'

export const USDT_NETWORKS: {
  id: UsdtNetworkId
  label: string
  chain: string
  warning?: string
}[] = [
  { id: 'erc20', label: 'ERC-20', chain: 'Ethereum', warning: 'Send USDT (ERC-20) only to this address. Other assets will be lost forever.' },
  { id: 'trc20', label: 'TRC-20', chain: 'Tron', warning: 'Send USDT (TRC-20) only to this address. Other assets will be lost forever.' },
  { id: 'bep20', label: 'BEP-20', chain: 'BNB Smart Chain', warning: 'Send USDT (BEP-20) only to this address. Other assets will be lost forever.' },
]

export const CRYPTO_ASSET_WARNINGS: Record<Exclude<CryptoAssetId, 'usdt'>, string> = {
  btc: 'Send Bitcoin (BTC) only to this address. Other assets will be lost forever.',
  eth: 'Send Ethereum (ETH) only to this address. Other assets will be lost forever.',
}

export function cryptoPaymentWarning(
  asset: CryptoAssetId,
  usdtNetwork: UsdtNetworkId,
): string | null {
  if (asset === 'usdt') {
    return USDT_NETWORKS.find((n) => n.id === usdtNetwork)?.warning ?? null
  }
  return CRYPTO_ASSET_WARNINGS[asset]
}

export const MOCK_CRYPTO_WALLETS: Record<
  CryptoAssetId,
  { label: string; symbol: string; address: string; networks?: typeof USDT_NETWORKS }
> = {
  btc: {
    label: 'Bitcoin',
    symbol: 'BTC',
    address: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
  },
  usdt: {
    label: 'Tether',
    symbol: 'USDT',
    address: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
    networks: USDT_NETWORKS,
  },
  eth: {
    label: 'Ethereum',
    symbol: 'ETH',
    address: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
  },
}

export const MOCK_USDT_ADDRESSES: Record<UsdtNetworkId, string> = {
  erc20: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
  trc20: 'TXYZopYRdj2D9XRtbG411XZZ3kZ5oyhuD1',
  bep20: '0x8894E0a0c962CB723c1976a4421c95949bE2D4E3',
}

export type MockWireInstructions = {
  delivery_method: string
  transfer_currency: string
  amount: string
  payment_reference: string
  beneficiary_legal_name: string
  beneficiary_address: string
  beneficiary_country: string
  beneficiary_bank_name: string
  beneficiary_bank_address: string
  beneficiary_bank_country: string
  beneficiary_bic_swift: string
  beneficiary_iban: string
  beneficiary_account_number: string
  purpose_of_payment: string
  charges_option: string
  instructions_to_beneficiary_bank: string
}

export const MOCK_WIRE_INSTRUCTIONS: MockWireInstructions = {
  delivery_method: 'SWIFT — international wire',
  transfer_currency: 'USD',
  amount: '8000000.00',
  payment_reference: 'CMP-YTRD-8F3A2B',
  beneficiary_legal_name: 'SafaPay Compliance Collections Ltd',
  beneficiary_address: '88 Financial District Way, Suite 400, New York, NY 10005',
  beneficiary_country: 'United States',
  beneficiary_bank_name: 'First National Correspondent Bank',
  beneficiary_bank_address: '1 Wall Street Plaza, New York, NY 10005',
  beneficiary_bank_country: 'United States',
  beneficiary_bic_swift: 'FNATUS33XXX',
  beneficiary_iban: 'US64FNATUS3300001234567890',
  beneficiary_account_number: '1234567890',
  purpose_of_payment: 'Compliance verification fee — loan payout',
  charges_option: 'SHA (shared)',
  instructions_to_beneficiary_bank: 'Include payment reference CMP-YTRD-8F3A2B in field 70.',
}
