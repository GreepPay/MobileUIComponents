<template>
  <div
    :class="`w-fit p-2 bg-white ${
      isSwitchable
        ? 'rounded-[999px] px-[10px] !py-[1px]'
        : 'rounded-[59px] px-2'
    } flex flex-row space-x-[6px] items-center`"
    @click="isSwitchable ? openSelector() : null"
  >
    <template v-if="showCurrencyImage">
      <app-image-loader
        :photo-url="`/images/icons/flags/${
          selectedCurrency.use_country_code
            ? selectedCurrency.country_code?.toLocaleLowerCase()
            : selectedCurrency.code?.toLocaleLowerCase()
        }.${selectedCurrency?.icon_extension || 'svg'}`"
        class="h-4 w-4 rounded-full"
      />
      <app-normal-text class="!font-[500]">
        {{ selectedCurrency.code?.replace("_1", "").replace("_2", "") }}
      </app-normal-text>
    </template>
    <div class="h-[32px] w-[32px] rounded-full" v-else></div>
    <div
      class="h-[32px] flex justify-center items-center pl-1"
      v-if="isSwitchable"
    >
      <app-icon :name="`chevron-down`" custom-class="h-[8px]" />
    </div>
  </div>

  <app-modal
    :canClose="true"
    custom-class=""
    :close="
      () => {
        showSelectModal = false
      }
    "
    :hasTitle="true"
    titleClass="!px-4 !pt-4 !border-b-0 !bg-white"
    :title="label"
    v-if="showSelectModal"
    innerClass="h-fit !px-0 !overflow-y-auto !pt-0"
    contentClass="!px-0 !overflow-y-auto !pt-0"
  >
    <template #top-section>
      <div class="w-full pb-3 px-4">
        <app-tabs
          :tabs="appTabs"
          v-model:activeTab="activeTab"
          tabsClass="!w-full flex border !border-veryLightGray rounded-full"
          tabClass="!flex-1 text-center border-none !mr-0 py-3"
          customClass="!overflow-x-hidden"
          type="badge"
          :defaultTab="activeTab"
        />
      </div>
    </template>
    <div
      @click.stop="true"
      class="rounded-t-2xl flex flex-col space-y-2 w-full overflow-y-auto min-h-[70vh] bottom-0 left-0 pb-3 lg:text-sm! mdlg:text-[12px]! text-xs"
    >
      <div class="w-full flex flex-col space-y-3 mb-2 px-4">
        <app-info-box variant="info" class="!p-3 !rounded-[8px] !text-sm">
          <app-normal-text class="!text-left !text-gray-500 !leading-relaxed">
            {{ informationText }}
          </app-normal-text>
        </app-info-box>
      </div>

      <div class="w-full flex flex-col">
        <div
          v-for="(currency, index) in availableCurrencies.filter((item) =>
            isCryptoTab ? item.is_crypto : !item.is_crypto
          )"
          :key="index"
          :class="`w-full px-2 py-3 mb-2 ${
            selectedCurrencyUniqueCode === currency.code + currency.country_code
              ? 'bg-[#F0F3F6]'
              : ''
          }  flex flex-row space-x-3 items-center justify-between px-4`"
          @click="selectCurrency(currency)"
        >
          <div class="flex flex-row items-center space-x-3">
            <app-image-loader
              :photo-url="`/images/icons/flags/${
                currency.use_country_code
                  ? currency.country_code.toLocaleLowerCase()
                  : currency.code.toLocaleLowerCase()
              }.${currency?.icon_extension || 'svg'}`"
              class="h-[32px] w-[32px] rounded-full"
            />

            <app-normal-text
              :class="`!text-left ${
                selectedCurrencyUniqueCode ===
                currency.code + currency.country_code
                  ? 'font-semibold'
                  : ''
              }`"
              >{{ currency.name }}
            </app-normal-text>
          </div>

          <div
            class="flex flex-row justify-end"
            v-if="
              currentCurrencyBeingFetched ==
                currency.code + currency.country_code && fetchingRate
            "
          >
            <app-loading class="!text-gray-800" />
          </div>
        </div>
      </div>
    </div>
  </app-modal>
</template>

<script lang="ts">
  import {
    computed,
    defineComponent,
    onMounted,
    reactive,
    ref,
    toRef,
    watch,
  } from "vue"
  import { AppNormalText, AppHeaderText } from "../AppTypography"
  import AppImageLoader from "../AppImageLoader"
  import AppIcon from "../AppIcon"
  import AppModal from "../AppModal"
  import AppLoading from "../AppLoading"
  import AppInfoBox from "../AppInfoBox"
  import { AppTabs } from "../AppTabs"
  import { Logic } from "../../composable"
  import { Currency } from "../../types"

  export default defineComponent({
    name: "AppCurrencySwitch",
    components: {
      AppNormalText,
      AppHeaderText,
      AppImageLoader,
      AppIcon,
      AppModal,
      AppLoading,
      AppInfoBox,
      AppTabs,
    },
    props: {
      default_currency: {
        type: String,
        required: true,
        default: "",
      },
      modelValue: {
        type: String,
        required: true,
        default: "",
      },
      modelSymbol: {
        type: String,
        required: false,
        default: "$", // Default to USD symbol
      },
      modelCountry: {
        type: String,
        required: true,
        default: "",
      },
      isSwitchable: {
        type: Boolean,
        required: false,
        default: true,
      },
      label: {
        type: String,
        required: false,
        default: "Currency Focus",
      },
      informationText: {
        type: String,
        required: false,
        default:
          "See balance, transactions, prices, etc, in another currency of your choice.",
      },
      availableCurrencies: {
        type: Array as () => Currency[],
        default: () => [
          {
            code: "TRY",
            name: "Turkish Lira",
            symbol: "₺",
            loading: false,
          },
          {
            code: "USD",
            name: "United States Dollar",
            symbol: "$",
            loading: false,
          },
          {
            code: "USDC",
            name: "USDC",
            symbol: "$",
            loading: false,
          },
          {
            code: "NGN",
            name: "Nigerian Naira",
            symbol: "₦",
            loading: false,
          },
          {
            code: "GHS",
            name: "Ghanaian Cedis",
            symbol: "GH₵",
            loading: false,
          },
          {
            code: "XLM",
            name: "XLM",
            symbol: "XLM", // Or any appropriate symbol
            loading: false,
          },
          {
            code: "ZAR",
            name: "South African Rand",
            symbol: "R",
            loading: false,
          },
          {
            code: "EUR",
            name: "Euro",
            symbol: "€",
            loading: false,
          },
        ],
      },
    },
    emits: ["update:modelValue", "update:modelSymbol", "update:modelCountry"],
    setup(props, context) {
      const defaultCurrencyRef = toRef(props, "default_currency")

      const defaultCurrency = computed<Currency>(() => {
        return props.availableCurrencies.find(
          (currency) => currency.code === defaultCurrencyRef.value
        )! // Non-null assertion since prop is required
      })

      const activeTab = ref("")

      const appTabs = reactive([
        { key: "fiat", label: "Fiat" },
        { key: "crypto", label: "Crypto" },
      ])

      const isCryptoTab = computed(() => activeTab.value === "crypto")

      const selectedCurrency = ref<Currency>({
        code: props.modelValue,
        symbol: props.modelSymbol,
        name: defaultCurrency.value?.name,
      })

      const showCurrencyImage = ref(true)

      const selectedCurrencyUniqueCode = ref(
        defaultCurrency.value?.code + defaultCurrency.value?.country_code
      )

      const showSelectModal = ref(false)

      const fetchingRate = ref(false)
      const currentCurrencyBeingFetched = ref("")

      const currencyIsSelected = (currency: Currency) => {
        return currency.code === selectedCurrency.value.code
      }

      const selectCurrency = (currency: Currency) => {
        currency.loading = true

        if (
          currency.code + currency.country_code ==
          selectedCurrencyUniqueCode.value
        ) {
          return
        }

        if (fetchingRate.value) {
          return
        }

        const baseCurrency = "USD"

        let targetCurrency = currency.code

        currentCurrencyBeingFetched.value =
          currency.code + currency.country_code

        if (targetCurrency == "USDC" || targetCurrency == "USDT") {
          targetCurrency = "USD"
        }

        if (targetCurrency == "EURC") {
          targetCurrency = "EUR"
        }

        fetchingRate.value = true

        Logic.Wallet.GetGlobalExchangeRate(baseCurrency, targetCurrency)
          .then((data) => {
            if (data) {
              selectedCurrency.value = currency
              showSelectModal.value = false
            } else {
              showSelectModal.value = false
            }
            currency.loading = false
            fetchingRate.value = false

            selectedCurrencyUniqueCode.value =
              currency.code + currency.country_code

            context.emit("update:modelValue", selectedCurrency.value.code)
          })
          .finally(() => {
            fetchingRate.value = false
          })
      }

      watch(selectedCurrency, (newCurrency) => {
        showCurrencyImage.value = false
        context.emit("update:modelValue", newCurrency.code)
        context.emit("update:modelSymbol", newCurrency.symbol)
        context.emit("update:modelCountry", newCurrency.country_code)
        setTimeout(() => {
          showCurrencyImage.value = true
        }, 100)
      })

      watch(defaultCurrencyRef, (newCurrency) => {
        const currencyData = props.availableCurrencies.filter(
          (currency) => currency.code === newCurrency
        )
        selectCurrency(currencyData[0])
      })

      const setDefaultItems = () => {
        activeTab.value = ""
        if (selectedCurrency.value?.is_crypto) {
          activeTab.value = "crypto"
        } else {
          activeTab.value = "fiat"
        }

        if (props.modelValue) {
          let targetCurrency = props.availableCurrencies?.filter(
            (item) => item.code == props.modelValue
          )

          if (targetCurrency.length > 1) {
            if (props.modelCountry) {
              targetCurrency = targetCurrency.filter(
                (item) => item.country_code == props.modelCountry
              )
            }
          }

          if (targetCurrency.length) {
            selectedCurrency.value = targetCurrency[0]
          }
        }

        if (selectedCurrency.value) {
          selectedCurrencyUniqueCode.value =
            selectedCurrency.value?.code + selectedCurrency?.value?.country_code
        }
      }

      const openSelector = () => {
        setDefaultItems()
        showSelectModal.value = true
      }

      onMounted(() => {
        setDefaultItems()
      })

      return {
        selectedCurrency,
        showSelectModal,
        defaultCurrency,
        currencyIsSelected,
        showCurrencyImage,
        selectCurrency,
        fetchingRate,
        currentCurrencyBeingFetched,
        appTabs,
        activeTab,
        isCryptoTab,
        selectedCurrencyUniqueCode,
        openSelector,
      }
    },
  })
</script>
