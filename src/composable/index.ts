// @ts-ignore
import { Currency } from "../types";
import { Logic as BaseLogic } from "@greep/logic";
import { getPlatforms } from "@ionic/vue";
import { computed, reactive } from "vue";

export let Logic: typeof BaseLogic = BaseLogic;

export const SetFrontendLogic = (logic: typeof BaseLogic) => {
  Logic = logic;
};

export const scrollToSpecificItem = (containerId: string, itemId: string) => {
  const containerBox = document.getElementById(containerId);

  if (containerBox) {
    const serviceElement = document.getElementById(itemId);

    if (serviceElement) {
      const containerRect = containerBox.getBoundingClientRect();
      const targetRect = serviceElement.getBoundingClientRect();
      const offset = targetRect.left - containerRect.left;
      containerBox.scrollBy({
        left: offset,
        behavior: "smooth",
      });
    }
  }
};

export const availableCurrencies = reactive<Currency[]>([
  {
    code: "NGN",
    name: "Nigerian Naira",
    country_name: "Nigeria",
    symbol: "₦",
    country_code: "NG",
    use_country_code: true,
    loading: false,
    payin_fees: [
      {
        type: "percentage",
        min: 55,
        value: 0.5,
        method: "bank_transfer",
      },
    ],
    payout_fees: [
      {
        type: "fixed",
        min: 100,
        value: 100,
        method: "bank_transfer",
      },
    ],
  },
  {
    code: "KES",
    name: "Kenyan Shilling",
    country_name: "Kenya",
    symbol: "KSh",
    country_code: "KE",
    use_country_code: true,
    loading: false,
    payin_fees: [
      {
        type: "percentage",
        min: 1,
        value: 0.5,
        method: "bank_transfer",
      },
      {
        type: "percentage",
        min: 1,
        value: 2,
        method: "momo",
      },
    ],
    payout_fees: [
      {
        type: "fixed",
        min: 200,
        value: 0.5,
        method: "bank_transfer",
      },
      {
        type: "percentage",
        min: 1,
        value: 2,
        method: "momo",
      },
    ],
  },
  {
    code: "UGX",
    name: "Ugandan Shilling",
    country_name: "Uganda",
    symbol: "USh",
    country_code: "UG",
    use_country_code: true,
    loading: false,
    payin_fees: [
      {
        type: "percentage",
        min: 1,
        value: 1,
        method: "bank_transfer",
      },
      {
        type: "percentage",
        min: 1,
        value: 1.5,
        method: "momo",
      },
    ],
    payout_fees: [
      {
        type: "percentage",
        min: 5000,
        value: 0.5,
        method: "bank_transfer",
      },
      {
        type: "percentage",
        min: 1,
        value: 1.5,
        method: "momo",
      },
    ],
  },
  {
    code: "GHS",
    name: "Ghanaian Cedi",
    country_name: "Ghana",
    symbol: "₵",
    country_code: "GH",
    use_country_code: true,
    loading: false,
    payin_fees: [
      {
        type: "percentage",
        min: 1,
        value: 2,
        method: "momo",
      },
    ],
  },
  {
    code: "ZAR",
    name: "South African Rand",
    country_name: "South Africa",
    symbol: "R",
    country_code: "ZA",
    use_country_code: true,
    loading: false,
    payin_fees: [
      {
        type: "percentage",
        min: 1,
        value: 2,
        method: "bank_transfer",
      },
    ],
    payout_fees: [
      {
        type: "percentage",
        min: 20,
        value: 0.5,
        method: "bank_transfer",
      },
    ],
  },
  {
    code: "RWF",
    name: "Rwandan Franc",
    country_name: "Rwanda",
    symbol: "RF",
    country_code: "RW",
    loading: false,
    use_country_code: true,
    payin_fees: [
      {
        type: "percentage",
        min: 1,
        value: 1,
        method: "bank_transfer",
      },
    ],
    payout_fees: [
      {
        type: "percentage",
        min: 1000,
        value: 0.5,
        method: "bank_transfer",
      },
    ],
  },
  {
    code: "XAF",
    name: "Cameroon CFA Franc",
    country_name: "Cameroon",
    symbol: "FCFA",
    country_code: "CM",
    loading: false,
    use_country_code: true,
    payin_fees: [
      {
        type: "percentage",
        min: 1,
        value: 1.75,
        method: "momo",
      },
    ],
    payout_fees: [
      {
        type: "percentage",
        min: 1,
        value: 1.5,
        method: "momo",
      },
    ],
  },
  {
    code: "XAF",
    name: "Central African Republic CFA Franc",
    country_name: "Central African Republic",
    symbol: "FCFA",
    country_code: "CF",
    use_country_code: true,
    loading: false,
    payin_fees: [
      {
        type: "percentage",
        min: 1,
        value: 2,
        method: "momo",
      },
    ],
  },
  {
    code: "XAF",
    name: "Chad CFA Franc",
    country_name: "Chad",
    symbol: "FCFA",
    country_code: "TD",
    use_country_code: true,
    loading: false,
    payin_fees: [
      {
        type: "percentage",
        min: 1,
        value: 2,
        method: "momo",
      },
    ],
  },
  {
    code: "XAF",
    name: "Republic of the Congo CFA Franc",
    country_name: "Republic of the Congo",
    symbol: "FCFA",
    country_code: "CG",
    use_country_code: true,
    loading: false,
    payin_fees: [
      {
        type: "percentage",
        min: 1,
        value: 2,
        method: "momo",
      },
    ],
  },
  {
    code: "XAF",
    name: "Equatorial Guinea CFA Franc",
    country_name: "Equatorial Guinea",
    symbol: "FCFA",
    country_code: "GQ",
    use_country_code: true,
    loading: false,
    payin_fees: [
      {
        type: "percentage",
        min: 1,
        value: 2,
        method: "momo",
      },
    ],
  },
  {
    code: "XAF",
    name: "Gabon CFA Franc",
    country_name: "Gabon",
    symbol: "FCFA",
    country_code: "GA",
    loading: false,
    use_country_code: true,
    payin_fees: [
      {
        type: "percentage",
        min: 1,
        value: 2,
        method: "momo",
      },
    ],
  },
  {
    code: "XOF",
    name: "Benin Franc",
    country_name: "Benin",
    symbol: "FCFA",
    country_code: "BJ",
    use_country_code: true,
    loading: false,
    payin_fees: [
      {
        type: "percentage",
        min: 1,
        value: 2,
        method: "momo",
      },
    ],
  },
  {
    code: "XOF",
    name: "Burkina Faso Franc",
    country_name: "Burkina Faso",
    use_country_code: true,
    symbol: "FCFA",
    country_code: "BF",
    loading: false,
    payin_fees: [
      {
        type: "percentage",
        min: 1,
        value: 2,
        method: "momo",
      },
    ],
  },
  {
    code: "XOF",
    name: "Guinea Franc",
    country_name: "Republic of Guinea",
    symbol: "FCFA",
    use_country_code: true,
    country_code: "GN",
    loading: false,
    payin_fees: [
      {
        type: "percentage",
        min: 1,
        value: 2,
        method: "momo",
      },
    ],
  },
  {
    code: "XOF",
    name: "Côte d'Ivoire Franc",
    country_name: "Côte d'Ivoire",
    use_country_code: true,
    symbol: "FCFA",
    country_code: "CI",
    loading: false,
    payin_fees: [
      {
        type: "percentage",
        min: 1,
        value: 2,
        method: "momo",
      },
    ],
  },
  {
    code: "XOF",
    name: "Mali Franc",
    country_name: "Mali",
    use_country_code: true,
    symbol: "FCFA",
    country_code: "ML",
    loading: false,
    payin_fees: [
      {
        type: "percentage",
        min: 1,
        value: 2,
        method: "momo",
      },
    ],
  },
  {
    code: "XOF",
    name: "Mauritania Franc",
    country_name: "Mauritania",
    use_country_code: true,
    symbol: "FCFA",
    country_code: "MR",
    loading: false,
    payin_fees: [
      {
        type: "percentage",
        min: 1,
        value: 2,
        method: "momo",
      },
    ],
  },
  {
    code: "XOF",
    name: "Niger Franc",
    country_name: "Niger",
    use_country_code: true,
    symbol: "FCFA",
    country_code: "NE",
    loading: false,
    payin_fees: [
      {
        type: "percentage",
        min: 1,
        value: 2,
        method: "momo",
      },
    ],
  },
  {
    code: "XOF",
    name: "Senegal Franc",
    country_name: "Senegal",
    use_country_code: true,
    symbol: "FCFA",
    country_code: "SN",
    loading: false,
    payin_fees: [
      {
        type: "percentage",
        min: 1,
        value: 2,
        method: "momo",
      },
    ],
  },
  {
    code: "XOF",
    name: "Togo Franc",
    country_name: "Togo",
    use_country_code: true,
    symbol: "FCFA",
    country_code: "TG",
    loading: false,
    payin_fees: [
      {
        type: "percentage",
        min: 1,
        value: 2,
        method: "momo",
      },
    ],
  },
  {
    code: "TZS",
    name: "Tanzanian Shilling",
    use_country_code: true,
    symbol: "TSh",
    country_name: "Tanzania",
    country_code: "TZ",
    loading: false,
    payin_fees: [
      {
        type: "percentage",
        min: 1,
        value: 1,
        method: "bank_transfer",
      },
    ],
    payout_fees: [
      {
        type: "percentage",
        min: 1000,
        value: 0.5,
        method: "bank_transfer",
      },
    ],
  },
  {
    code: "MWK",
    name: "Malawian Kwacha",
    country_name: "Malawi",
    use_country_code: true,
    symbol: "MK",
    country_code: "MW",
    loading: false,
    payin_fees: [
      {
        type: "percentage",
        min: 750,
        value: 1,
        method: "bank_transfer",
      },
      {
        type: "percentage",
        min: 750,
        value: 2,
        method: "momo",
      },
    ],
    payout_fees: [
      {
        type: "percentage",
        min: 750,
        value: 0.5,
        method: "bank_transfer",
      },
      {
        type: "percentage",
        min: 1,
        value: 1,
        method: "momo",
      },
    ],
  },
  {
    code: "XLM",
    name: "Stellar Lumens",
    symbol: "XLM",
    country_code: "US",
    loading: false,
    is_crypto: true,
  },
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
    is_foreign_currency: true,
  },
  {
    code: "EUR",
    name: "Euro (€)",
    symbol: "€",
    loading: false,
    icon_extension: "svg",
    country_code: "EU",
    allow_p2p: false,
    is_foreign_currency: true,
  },
  {
    code: "USDC",
    name: "USDC ($)",
    symbol: "$",
    loading: false,
    icon_extension: "svg",
    country_code: "US",
    allow_p2p: false,
    is_crypto: true,
    can_accept_deposit: true,
  },
  {
    code: "EURC",
    name: "EURC (€)",
    symbol: "€",
    loading: false,
    icon_extension: "png",
    country_code: "EU",
    allow_p2p: false,
    is_crypto: true,
  },
  {
    code: "USDT",
    name: "USDT ($)",
    symbol: "$",
    loading: false,
    icon_extension: "svg",
    country_code: "US",
    allow_p2p: false,
    is_crypto: true,
    can_accept_deposit: true,
  },
  {
    code: "BTC",
    name: "BTC",
    symbol: "₿",
    loading: false,
    icon_extension: "svg",
    country_code: "US",
    is_crypto: true,
  },
  {
    code: "ETH",
    name: "ETH",
    symbol: "Ξ",
    loading: false,
    icon_extension: "png",
    country_code: "US",
    is_crypto: true,
  },
]);

export const getBottomPadding = computed(() => {
  // Replace this with your actual platform detection logic
  const isAndroid = getPlatforms()[0] === "android";

  return isAndroid
    ? "padding-bottom: calc(env(safe-area-inset-bottom) + 20px) !important;"
    : "padding-bottom: calc(env(safe-area-inset-bottom) + 16px) !important;";
});
