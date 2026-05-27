/**
 * Bill payment catalog: UAE services, higher-education institutions, and international payment channels.
 */

export type BillProduct = { id: string; label: string }

export type BillerConfig = {
  id: string
  name: string
  referenceLabel: string
  referenceHint: string
  requiresProduct: boolean
  products?: BillProduct[]
  orderIdApplicable: boolean
  orderIdHint?: string
}

export type ServiceConfig = {
  id: string
  label: string
  description: string
  billers: BillerConfig[]
}

const uniProducts: BillProduct[] = [
  { id: 'tuition', label: 'Tuition / academic fees' },
  { id: 'housing', label: 'Housing / accommodation' },
  { id: 'other', label: 'Other charges' },
]

function uniBiller(
  id: string,
  name: string,
  referenceHint: string,
): BillerConfig {
  return {
    id,
    name,
    referenceLabel: 'Student or billing reference',
    referenceHint,
    requiresProduct: true,
    products: uniProducts,
    orderIdApplicable: true,
    orderIdHint: 'Optional: instalment, invoice, or payment plan number from the institution.',
  }
}

export const BILL_SERVICES: ServiceConfig[] = [
  {
    id: 'utilities',
    label: 'Utilities',
    description: 'Electricity, water, and district cooling across the Emirates.',
    billers: [
      {
        id: 'dewa',
        name: 'DEWA (Dubai Electricity & Water)',
        referenceLabel: 'DEWA account / premise number',
        referenceHint: 'Shown on your DEWA bill, Smart App, or Dubai Now — typically 9 digits.',
        requiresProduct: false,
        orderIdApplicable: false,
      },
      {
        id: 'empower',
        name: 'Empower (district cooling)',
        referenceLabel: 'Cooling account / contract number',
        referenceHint: 'Account number on your Empower invoice or building portal.',
        requiresProduct: false,
        orderIdApplicable: false,
      },
      {
        id: 'addc',
        name: 'ADDC (Abu Dhabi Distribution)',
        referenceLabel: 'ADDC account number',
        referenceHint: 'Electricity and water account on your Abu Dhabi bill.',
        requiresProduct: false,
        orderIdApplicable: false,
      },
      {
        id: 'sewa',
        name: 'SEWA (Sharjah)',
        referenceLabel: 'SEWA account number',
        referenceHint: 'Customer account on your Sharjah utility bill; some channels also verify your registered mobile.',
        requiresProduct: false,
        orderIdApplicable: false,
      },
    ],
  },
  {
    id: 'telecom',
    label: 'Telecom',
    description: 'Mobile, home internet, and landline providers.',
    billers: [
      {
        id: 'etisalat',
        name: 'Etisalat by e&',
        referenceLabel: 'Account or UAE mobile number',
        referenceHint: 'Postpaid account (often 10 digits) or mobile 05xxxxxxxx for quick pay flows.',
        requiresProduct: true,
        products: [
          { id: 'postpaid', label: 'Postpaid bill' },
          { id: 'prepaid', label: 'Prepaid / recharge' },
          { id: 'home_internet', label: 'Home / eLife internet' },
        ],
        orderIdApplicable: true,
        orderIdHint: 'Optional: bundle or add-on order reference if supplied by the channel.',
      },
      {
        id: 'du',
        name: 'du',
        referenceLabel: 'du account or mobile number',
        referenceHint: 'Account number from your bill or UAE mobile for pay-as-you-go.',
        requiresProduct: true,
        products: [
          { id: 'postpaid', label: 'Postpaid' },
          { id: 'prepaid', label: 'Prepaid top-up' },
          { id: 'home', label: 'Home internet' },
        ],
        orderIdApplicable: true,
        orderIdHint: 'Optional: reference from du app or partner checkout.',
      },
      {
        id: 'virgin',
        name: 'Virgin Mobile UAE',
        referenceLabel: 'Virgin mobile number',
        referenceHint: 'UAE mobile linked to your Virgin Mobile account.',
        requiresProduct: true,
        products: [
          { id: 'bundle', label: 'Plan / bundle payment' },
          { id: 'topup', label: 'Quick top-up' },
        ],
        orderIdApplicable: false,
      },
    ],
  },
  {
    id: 'transport',
    label: 'Transport',
    description: 'Tolls, public transport, and RTA-related payments.',
    billers: [
      {
        id: 'salik',
        name: 'Salik (Dubai toll)',
        referenceLabel: 'Salik account / tag number',
        referenceHint: 'From your Salik account dashboard or sticker registration.',
        requiresProduct: true,
        products: [
          { id: 'wallet_topup', label: 'Wallet top-up' },
          { id: 'registration', label: 'Tag / registration fee' },
        ],
        orderIdApplicable: false,
      },
      {
        id: 'nol',
        name: 'Nol (RTA public transport)',
        referenceLabel: 'Nol card number',
        referenceHint: '16-digit number on the back of your Nol card.',
        requiresProduct: true,
        products: [
          { id: 'topup', label: 'Balance top-up' },
          { id: 'season', label: 'Season pass / bundle' },
          { id: 'replacement', label: 'Card replacement fee' },
        ],
        orderIdApplicable: true,
        orderIdHint: 'Optional: RTA reference from app or kiosk receipt.',
      },
      {
        id: 'rta_parking',
        name: 'RTA parking & mParking',
        referenceLabel: 'Plate number or mParking session ref',
        referenceHint: 'Vehicle plate (e.g. A 12345) or SMS session code where applicable.',
        requiresProduct: true,
        products: [
          { id: 'mparking', label: 'mParking session' },
          { id: 'seasonal', label: 'Seasonal parking card' },
        ],
        orderIdApplicable: true,
        orderIdHint: 'Optional: session or transaction ID from SMS.',
      },
    ],
  },
  {
    id: 'insurance',
    label: 'Insurance',
    description: 'Motor, health, and general policies with UAE insurers.',
    billers: [
      {
        id: 'sukoon',
        name: 'Sukoon Insurance',
        referenceLabel: 'Policy number',
        referenceHint: 'Policy number from your certificate or renewal notice.',
        requiresProduct: true,
        products: [
          { id: 'motor', label: 'Motor' },
          { id: 'health', label: 'Health / medical' },
          { id: 'other', label: 'Other / property' },
        ],
        orderIdApplicable: true,
        orderIdHint: 'Optional: renewal quote or broker reference.',
      },
      {
        id: 'gig',
        name: 'GIG Gulf Insurance',
        referenceLabel: 'Policy / client reference',
        referenceHint: 'As shown on your GIG invoice or portal.',
        requiresProduct: true,
        products: [
          { id: 'motor', label: 'Motor' },
          { id: 'travel', label: 'Travel' },
          { id: 'corp', label: 'Corporate / SME' },
        ],
        orderIdApplicable: true,
        orderIdHint: 'Optional: endorsement or quote ID.',
      },
      {
        id: 'takaful_emarat',
        name: 'Takaful Emarat',
        referenceLabel: 'Policy / membership number',
        referenceHint: 'From your takaful certificate or mobile app.',
        requiresProduct: false,
        orderIdApplicable: true,
        orderIdHint: 'Optional: claim or renewal reference.',
      },
    ],
  },
  {
    id: 'taxes_gov',
    label: 'Taxes & government',
    description: 'Federal and local government payments.',
    billers: [
      {
        id: 'fta',
        name: 'FTA / corporate tax / VAT (GIBAN)',
        referenceLabel: 'GIBAN or FTA reference',
        referenceHint: 'Use the reference from the Federal Tax Authority or your approved banking channel.',
        requiresProduct: true,
        products: [
          { id: 'vat', label: 'VAT payment' },
          { id: 'corp_tax', label: 'Corporate tax instalment' },
          { id: 'other_fta', label: 'Other FTA reference' },
        ],
        orderIdApplicable: true,
        orderIdHint: 'Optional: return period or filing reference.',
      },
      {
        id: 'dubai_muni',
        name: 'Dubai Municipality',
        referenceLabel: 'Premise / property number',
        referenceHint: 'As on your municipality invoice or building levy notice.',
        requiresProduct: false,
        orderIdApplicable: true,
        orderIdHint: 'Optional: invoice batch number.',
      },
      {
        id: 'dubai_police',
        name: 'Dubai Police (fines)',
        referenceLabel: 'Fine / notice number',
        referenceHint: 'From Dubai Police app, SMS, or traffic file lookup.',
        requiresProduct: true,
        products: [
          { id: 'traffic', label: 'Traffic fines' },
          { id: 'parking', label: 'Parking violations' },
        ],
        orderIdApplicable: true,
        orderIdHint: 'Optional: batch payment or portal transaction ID.',
      },
    ],
  },
  {
    id: 'housing',
    label: 'Housing & property',
    description: 'Ejari, service charges, and community fees.',
    billers: [
      {
        id: 'ejari',
        name: 'Ejari (lease registration)',
        referenceLabel: 'Ejari contract number',
        referenceHint: 'Contract reference from your registered tenancy certificate.',
        requiresProduct: false,
        orderIdApplicable: true,
        orderIdHint: 'Optional: DLD transaction reference.',
      },
      {
        id: 'service_charge',
        name: 'Community / service charge',
        referenceLabel: 'Unit or invoice reference',
        referenceHint: 'As issued by your property management or owners association.',
        requiresProduct: false,
        orderIdApplicable: true,
        orderIdHint: 'Optional: invoice number.',
      },
    ],
  },
  {
    id: 'education',
    label: 'Education',
    description: 'Universities and higher education in the UAE.',
    billers: [
      uniBiller('uaeu', 'United Arab Emirates University (UAEU)', 'From UAEU student portal or fee notice.'),
      uniBiller('khalifa', 'Khalifa University', 'From Khalifa University billing or student account.'),
      uniBiller('nyuad', 'New York University Abu Dhabi (NYUAD)', 'From NYUAD student services or payment instructions.'),
      uniBiller('aus', 'American University of Sharjah (AUS)', 'From AUS student account or cashier reference.'),
      uniBiller('aud', 'American University in Dubai (AUD)', 'From AUD finance office or online payment slip.'),
      uniBiller('uos', 'University of Sharjah', 'From University of Sharjah student billing.'),
      uniBiller('zu', 'Zayed University', 'From Zayed University student account.'),
      uniBiller('hw_dubai', 'Heriot-Watt University Dubai', 'From HW Dubai student portal or invoice.'),
      uniBiller('uowd', 'University of Wollongong in Dubai (UOWD)', 'From UOWD student finance reference.'),
      uniBiller('bits_dubai', 'BITS Pilani Dubai Campus', 'From BITS Dubai fee portal or receipt.'),
      uniBiller('manipal_dubai', 'Manipal Academy of Higher Education, Dubai', 'From MAHE Dubai student billing.'),
      uniBiller('cud', 'Canadian University Dubai', 'From CUD student account or payment advice.'),
      uniBiller('mbru', 'Mohammed Bin Rashid University of Medicine and Health Sciences (MBRU)', 'From MBRU student billing.'),
      {
        id: 'k12_private',
        name: 'Private K–12 school (other)',
        referenceLabel: 'Student ID / admission reference',
        referenceHint: 'Student or invoice number from your school portal (e.g. KHDA-registered schools).',
        requiresProduct: true,
        products: [
          { id: 'tuition', label: 'Tuition instalment' },
          { id: 'transport', label: 'School transport' },
          { id: 'extras', label: 'Activities / extras' },
        ],
        orderIdApplicable: true,
        orderIdHint: 'Optional: fee instalment or receipt number.',
      },
    ],
  },
  {
    id: 'international',
    label: 'International',
    description: 'Cross-border transfers and global payment rails.',
    billers: [
      {
        id: 'swift_wire',
        name: 'International bank transfer (SWIFT)',
        referenceLabel: 'Beneficiary reference / payment details',
        referenceHint: 'Use the reference or instructions from your beneficiary bank or invoice.',
        requiresProduct: true,
        products: [
          { id: 'tuition_abroad', label: 'Tuition / education abroad' },
          { id: 'family', label: 'Family support' },
          { id: 'business', label: 'Business / supplier' },
          { id: 'other', label: 'Other' },
        ],
        orderIdApplicable: true,
        orderIdHint: 'Optional: sender-to-receiver message or invoice number.',
      },
      {
        id: 'wise',
        name: 'Wise',
        referenceLabel: 'Wise reference / transfer number',
        referenceHint: 'From your Wise app or email confirmation (e.g. transfer or balance add reference).',
        requiresProduct: true,
        products: [
          { id: 'balance', label: 'Add to Wise balance' },
          { id: 'send', label: 'Send money / recipient payment' },
        ],
        orderIdApplicable: true,
        orderIdHint: 'Optional: recipient-side reference.',
      },
      {
        id: 'western_union',
        name: 'Western Union',
        referenceLabel: 'MTCN or tracking number',
        referenceHint: 'Money Transfer Control Number or tracking from your transfer receipt.',
        requiresProduct: true,
        products: [
          { id: 'send', label: 'Send money' },
          { id: 'bill_pay', label: 'Bill payment' },
        ],
        orderIdApplicable: true,
        orderIdHint: 'Optional: sender name or location code from receipt.',
      },
      {
        id: 'moneygram',
        name: 'MoneyGram',
        referenceLabel: 'Reference / authorization number',
        referenceHint: 'From your MoneyGram receipt or receive transaction details.',
        requiresProduct: false,
        orderIdApplicable: true,
        orderIdHint: 'Optional: eight-digit reference extension if shown.',
      },
      {
        id: 'flywire',
        name: 'Flywire (education payments)',
        referenceLabel: 'Flywire payment ID',
        referenceHint: 'Payment ID from your institution’s Flywire checkout or email.',
        requiresProduct: true,
        products: [
          { id: 'tuition', label: 'Tuition' },
          { id: 'deposit', label: 'Deposit / seat fee' },
          { id: 'housing', label: 'Housing deposit' },
        ],
        orderIdApplicable: true,
        orderIdHint: 'Optional: student ID or application number.',
      },
      {
        id: 'paypal',
        name: 'PayPal',
        referenceLabel: 'Invoice ID or merchant reference',
        referenceHint: 'From PayPal activity details or merchant invoice.',
        requiresProduct: true,
        products: [
          { id: 'goods', label: 'Goods & services' },
          { id: 'subscription', label: 'Subscription / recurring' },
        ],
        orderIdApplicable: true,
        orderIdHint: 'Optional: transaction ID from PayPal.',
      },
      {
        id: 'remitly',
        name: 'Remitly',
        referenceLabel: 'Transfer reference / recipient',
        referenceHint: 'From Remitly app or confirmation email.',
        requiresProduct: true,
        products: [
          { id: 'bank_deposit', label: 'Bank deposit' },
          { id: 'cash_pickup', label: 'Cash pickup' },
          { id: 'wallet', label: 'Mobile wallet' },
        ],
        orderIdApplicable: true,
        orderIdHint: 'Optional: partner pickup reference.',
      },
      {
        id: 'convera',
        name: 'Convera (GlobalPay for Students / business)',
        referenceLabel: 'Payment or student reference',
        referenceHint: 'From Convera / GlobalPay checkout or your institution’s payment instructions.',
        requiresProduct: true,
        products: [
          { id: 'education', label: 'Education / tuition' },
          { id: 'business', label: 'Business payment' },
        ],
        orderIdApplicable: true,
        orderIdHint: 'Optional: order number from payment portal.',
      },
      {
        id: 'sepa_eur',
        name: 'SEPA / EUR region payment',
        referenceLabel: 'IBAN or creditor reference',
        referenceHint: 'Structured creditor reference or IBAN payment details from your European biller.',
        requiresProduct: true,
        products: [
          { id: 'tuition', label: 'University / tuition (Europe)' },
          { id: 'rent', label: 'Rent / housing' },
          { id: 'other', label: 'Other SEPA creditor' },
        ],
        orderIdApplicable: true,
        orderIdHint: 'Optional: mandate or invoice number.',
      },
    ],
  },
  {
    id: 'other',
    label: 'Other services',
    description: 'Retail, subscriptions, and other domestic billers.',
    billers: [
      {
        id: 'generic',
        name: 'Other biller',
        referenceLabel: 'Biller reference / account number',
        referenceHint: 'Reference number supplied by the merchant or biller.',
        requiresProduct: false,
        orderIdApplicable: true,
        orderIdHint: 'Optional: merchant order or tracking ID.',
      },
    ],
  },
]

export function getService(serviceId: string): ServiceConfig | undefined {
  return BILL_SERVICES.find((s) => s.id === serviceId)
}

export function getBiller(serviceId: string, billerId: string): BillerConfig | undefined {
  const s = getService(serviceId)
  return s?.billers.find((b) => b.id === billerId)
}

/** Flat list for admin fee overrides (service + biller keys match the pay form). */
export function getAllBillerKeys(): { service_id: string; biller_id: string; label: string }[] {
  const out: { service_id: string; biller_id: string; label: string }[] = []
  for (const s of BILL_SERVICES) {
    for (const b of s.billers) {
      out.push({ service_id: s.id, biller_id: b.id, label: `${s.label} — ${b.name}` })
    }
  }
  return out
}

export const DEFAULT_SERVICE_ID = BILL_SERVICES[0]?.id ?? 'utilities'
