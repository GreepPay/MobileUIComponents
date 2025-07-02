import { reactive } from "vue"
import { Currency } from "../types"

export const availableCurrencies = reactive<Currency[]>([
  {
    code: "NGN",
    name: "Nigerian Naira",
    symbol: "₦",
    country_code: "NG",
    loading: false,
  },
  {
    code: "KES",
    name: "Kenyan Shilling",
    symbol: "KSh",
    country_code: "KE",
    loading: false,
  },
  {
    code: "UGX",
    name: "Ugandan Shilling",
    symbol: "USh",
    country_code: "UG",
    loading: false,
  },
  {
    code: "GHS",
    name: "Ghanaian Cedi",
    symbol: "₵",
    country_code: "GH",
    loading: false,
  },
  {
    code: "ZAR",
    name: "South African Rand",
    symbol: "R",
    country_code: "ZA",
    loading: false,
  },
  // {
  //   code: "AOA",
  //   name: "Angolan Kwanza",
  //   symbol: "Kz",
  // },
  {
    code: "ZMW",
    name: "Zambian Kwacha",
    symbol: "ZK",
    country_code: "ZM",
    loading: false,
  },
  // {
  //   code: "ZWL",
  //   name: "Zimbabwean Dollar",
  //   symbol: "Z$",
  // },
])

export const supportedCountries = reactive([
  {
    country: "Nigeria",
    isoCode: "NG",
    currency: "NGN",
    idVerificationMethods: [
      { key: "bvn", value: "Bank Verification Number (BVN)" },
      // { key: "phone", value: "Phone Number" },
      { key: "nin", value: "National Identification Number (NIN)" },
      { key: "dl", value: "Driver’s License" },
      { key: "voter", value: "Voter’s Card" },
      { key: "passport", value: "International Passport" },
    ],
  },
  {
    country: "Kenya",
    isoCode: "KE",
    currency: "KES",
    idVerificationMethods: [
      { key: "nid", value: "National ID" },
      { key: "passport", value: "International Passport" },
      { key: "kra_pin", value: "Kenya KRA PIN" },
    ],
  },
  {
    country: "Uganda",
    isoCode: "UG",
    currency: "UGX",
    idVerificationMethods: [
      { key: "nin", value: "National Identification Number (NIN)" },
    ],
  },
  {
    country: "Ghana",
    isoCode: "GH",
    currency: "GHS",
    idVerificationMethods: [
      { key: "passport", value: "International Passport" },
      { key: "dl", value: "Driver’s License" },
      { key: "voter", value: "Voter’s ID" },
      { key: "tin", value: "Taxpayer Identification Number (TIN)" },
      { key: "ssnit", value: "Social Security Number (SSNIT ID)" },
      { key: "digital_address", value: "Ghana Digital Address" },
    ],
  },
  {
    country: "South Africa",
    isoCode: "ZA",
    currency: "ZAR",
    idVerificationMethods: [
      { key: "sa_id", value: "South African National ID" },
    ],
  },
  {
    country: "Angola",
    isoCode: "AO",
    currency: "AOA",
    idVerificationMethods: [
      { key: "national_id", value: "Angola National ID" },
    ],
  },
  {
    country: "Zambia",
    isoCode: "ZM",
    currency: "ZMW",
    idVerificationMethods: [
      { key: "nrc", value: "National Registration Card (NRC)" },
    ],
  },
  {
    country: "Zimbabwe",
    isoCode: "ZW",
    currency: "ZWL",
    idVerificationMethods: [
      { key: "national_id", value: "Zimbabwe National ID" },
      { key: "credit_check", value: "Credit Check" },
    ],
  },
])

export interface MessageInfo {
  text_content: string
  user_uuid: string
  type: "text" | "info"
  info_icon?: string
  user_name?: string
  media?: {
    type: "image"
    url: string
  }
  actions?: {
    label: string
    type: "success" | "info" | "danger" | "warning"
    message: string
  }[]
}

export const withdrawalAvailableCurrencies = reactive([
  {
    code: "TRY",
    name: "Turkish Lira (₺)",
    symbol: "₺",
    loading: false,
    icon_extension: "svg",
    country_code: "TR",
    allow_p2p: true,
  },
  {
    code: "USD",
    name: "United States Dollar ($)",
    symbol: "$",
    loading: false,
    icon_extension: "svg",
    country_code: "US",
    allow_p2p: false,
  },
  {
    code: "EUR",
    name: "Euro (€)",
    symbol: "€",
    loading: false,
    icon_extension: "svg",
    country_code: "EU",
    allow_p2p: false,
  },
  {
    code: "USDC",
    name: "USDC ($)",
    symbol: "$",
    loading: false,
    icon_extension: "svg",
    country_code: "US",
    allow_p2p: false,
  },
  {
    code: "EURC",
    name: "EURC (€)",
    symbol: "€",
    loading: false,
    icon_extension: "png",
    country_code: "EU",
    allow_p2p: false,
  },
  {
    code: "USDT",
    name: "USDT ($)",
    symbol: "$",
    loading: false,
    icon_extension: "svg",
    country_code: "US",
    allow_p2p: false,
  },
  // {
  //   code: "BTC",
  //   name: "BTC",
  //   symbol: "₿",
  //   loading: false,
  //   icon_extension: "svg",
  //   country_code: "US"
  // },
  // {
  //   code: "ETH",
  //   name: "ETH",
  //   symbol: "Ξ",
  //   loading: false,
  //   icon_extension: "png",
  //   country_code: "US"
  // },
  {
    code: "NGN",
    name: "Nigerian Naira (₦)",
    symbol: "₦",
    loading: false,
    icon_extension: "svg",
    country_code: "NG",
    allow_p2p: false,
  },
  {
    code: "GHS",
    name: "Ghanaian Cedis (₵)",
    symbol: "₵",
    loading: false,
    icon_extension: "svg",
    country_code: "GH",
    allow_p2p: false,
  },
  {
    code: "KES",
    name: "Kenyan Shilling (KES)",
    symbol: "KES",
    loading: false,
    icon_extension: "png",
    country_code: "KE",
    allow_p2p: false,
  },
  {
    code: "ZAR",
    name: "South African Rand (R)",
    symbol: "R",
    loading: false,
    icon_extension: "svg",
    country_code: "ZA",
    allow_p2p: false,
  },
])
