export type Maybe<T> = T | null;

export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
  /**
   * Loose type that allows any value. Be careful when passing in large `Int` or `Float` literals,
   * as they may not be parsed correctly on the server side. Use `String` literals if you are
   * dealing with really large numbers to be on the safe side.
   */
  Mixed: any;
  /** Can be used as an argument to upload files using https://github.com/jaydenseric/graphql-multipart-request-spec */
  Upload: any;
};
export interface FormContentRule {
  max: number;
  characterToAdd: string;
  addAfterCount: number;
}

export interface SelectOption {
  key: any;
  value: string;
  altValue?: string;
  extras?: string;
  hasIcon?: boolean;
  isImage?: boolean;
  isForm?: boolean;
  useSlot?: boolean;
  extraInfo?: any;
  formField?: {
    type: "text" | "tel" | "select";
    placeholder: string;
    value: string;
    validations: FormRule[];
    customClass: string;
    label: string;
    name: string;
    contentRule?: FormContentRule;
    selectOption?: SelectOption[];
  }[];
}

export interface FormRule {
  type:
    | "isRequired"
    | "isGreaterThan"
    | "isLessThan"
    | "isEqualsTo"
    | "isGreaterThanOrEqualsTo"
    | "isLessThanOrEqualsTo"
    | "isRegex"
    | "isCondition";
  value: any | undefined;
  errorMessage: string | undefined;
}

export interface Currency {
  code: string;
  name: string;
  symbol: string;
  loading?: boolean;
  country_code?: string;
  country_name?: string;
  icon_extension?: string;
  allow_p2p?: boolean;
  is_foreign_currency?: boolean;
  use_country_code?: boolean;
  fallback_code?: string;
  is_crypto?: boolean;
  can_accept_deposit?: boolean;
  card_payment?: {
    min: number;
    max: number;
    fee: string;
  };
  payin_fees?: {
    type: "percentage" | "fixed";
    value: number;
    min: number;
    method: "bank_transfer" | "momo";
  }[];
  payout_fees?: {
    type: "percentage" | "fixed";
    value: number;
    min: number;
    method: "bank_transfer" | "momo";
  }[];
}
