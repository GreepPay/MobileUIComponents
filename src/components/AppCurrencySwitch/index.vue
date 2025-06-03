<template>
  <div
    :class="`w-fit p-2 bg-white ${
      isSwitchable ? 'rounded-[999px] px-3' : 'rounded-[59px] px-3'
    } flex flex-row space-x-[6px] items-center`"
    @click="isSwitchable ? (showSelectModal = true) : null"
  >
    <app-image-loader
      :photo-url="`/images/icons/flags/${selectedCurrency.code.toLocaleLowerCase()}.${
        selectedCurrency?.icon_extension || 'svg'
      }`"
      class="h-[32px] w-[32px] rounded-full"
      v-if="showCurrencyImage"
    />
    <div class="h-[32px] w-[32px] rounded-full" v-else></div>
    <div class="h-[32px] flex justify-center items-center" v-if="isSwitchable">
      <app-icon :name="`chevron-down`" custom-class="h-[8px]" />
    </div>
  </div>

  <app-modal
    :canClose="true"
    custom-class="mdlg:hidden!"
    :close="
      () => {
        showSelectModal = false;
      }
    "
    v-if="showSelectModal"
  >
    <div
      @click.stop="true"
      class="rounded-t-2xl flex flex-col space-y-2 bg-white w-full absolute overflow-y-auto !h-[400px] bottom-0 left-0 pb-3 px-3 lg:text-sm! mdlg:text-[12px]! text-xs"
    >
      <div
        class="flex items-center justify-center sticky top-0 bg-white w-full pt-3"
      >
        <span class="bg-gray-700 rounded-full w-[30px] h-[4px]"></span>
      </div>

      <div class="w-full flex flex-col space-y-2">
        <div class="w-full flex flex-row items-center justify-between">
          <app-normal-text class="font-semibold text-gray-600"
            >Default</app-normal-text
          >

          <app-normal-text class="font-semibold text-primary"
            >Change</app-normal-text
          >
        </div>

        <div
          @click="selectCurrency(defaultCurrency)"
          :class="`w-full px-2 py-2 ${
            currencyIsSelected(defaultCurrency)
              ? 'border-[1px] border-[#0A141E] rounded-[999px]'
              : 'border-[1px] border-transparent'
          }  flex flex-row space-x-3 items-center justify-between`"
        >
          <div class="flex flex-row items-center space-x-3">
            <app-image-loader
              :photo-url="`/images/icons/flags/${defaultCurrency.code.toLocaleLowerCase()}.${
                defaultCurrency?.icon_extension || 'svg'
              }`"
              class="h-[32px] w-[32px] rounded-full"
            />

            <app-normal-text
              :class="`!text-left ${
                currencyIsSelected(defaultCurrency) ? 'font-semibold' : ''
              }`"
              >{{ defaultCurrency.name }} ({{
                defaultCurrency.symbol
              }})</app-normal-text
            >
          </div>

          <div class="flex flex-row justify-end" v-if="defaultCurrency.loading">
            <app-loading class="!text-gray-800 -mr-[5px]" />
          </div>
        </div>
      </div>

      <div class="w-full flex flex-col">
        <div
          class="w-full flex flex-row items-center justify-between pt-3 pb-2"
        >
          <app-normal-text class="font-semibold text-gray-600"
            >Others</app-normal-text
          >
        </div>

        <div
          v-for="(currency, index) in availableCurrencies.filter(
            (currency) => currency.code !== defaultCurrency.code
          )"
          :key="index"
          :class="`w-full px-2 py-2 mb-2 ${
            currencyIsSelected(currency)
              ? 'border-[1px] border-[#0A141E] rounded-[999px]'
              : 'border-[1px] border-transparent'
          }  flex flex-row space-x-3 items-center justify-between`"
          @click="selectCurrency(currency)"
        >
          <div class="flex flex-row items-center space-x-3">
            <app-image-loader
              :photo-url="`/images/icons/flags/${currency.code.toLocaleLowerCase()}.${
                currency?.icon_extension || 'svg'
              }`"
              class="h-[32px] w-[32px] rounded-full"
            />

            <app-normal-text
              :class="`!text-left ${
                currencyIsSelected(currency) ? 'font-semibold' : ''
              }`"
              >{{ currency.name }} ({{ currency.symbol }})</app-normal-text
            >
          </div>

          <div class="flex flex-row justify-end" v-if="currency.loading">
            <app-loading class="!text-gray-800" />
          </div>
        </div>
      </div>
    </div>
  </app-modal>
</template>

<script lang="ts">
import { computed, defineComponent, onMounted, ref, toRef, watch } from "vue";
import { AppNormalText, AppHeaderText } from "../AppTypography";
import AppImageLoader from "../AppImageLoader";
import AppIcon from "../AppIcon";
import AppModal from "../AppModal";
import AppLoading from "../AppLoading";
import { Logic } from "../../composable";
import { Currency } from "../../types";

export default defineComponent({
  name: "AppCurrencySwitch",
  components: {
    AppNormalText,
    AppHeaderText,
    AppImageLoader,
    AppIcon,
    AppModal,
    AppLoading,
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
    isSwitchable: {
      type: Boolean,
      required: false,
      default: true,
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
  emits: ["update:modelValue", "update:modelSymbol"],
  setup(props, context) {
    const defaultCurrencyRef = toRef(props, "default_currency");

    const defaultCurrency = computed<Currency>(() => {
      return props.availableCurrencies.find(
        (currency) => currency.code === defaultCurrencyRef.value
      )!; // Non-null assertion since prop is required
    });

    const selectedCurrency = ref<Currency>({
      code: props.modelValue,
      symbol: props.modelSymbol,
      name: defaultCurrency.value?.name,
    });

    const showCurrencyImage = ref(true);

    const showSelectModal = ref(false);

    const currencyIsSelected = (currency: Currency) => {
      return currency.code === selectedCurrency.value.code;
    };

    const selectCurrency = (currency: Currency) => {
      currency.loading = true;

      if (currency.code == selectedCurrency.value.code) {
        return;
      }

      const baseCurrency = "USD";

      let targetCurrency = currency.code;

      if (targetCurrency == "USDC" || targetCurrency == "USDT") {
        targetCurrency = "USD";
      }

      if (targetCurrency == "EURC") {
        targetCurrency = "EUR";
      }

      Logic.Wallet.GetGlobalExchangeRate(baseCurrency, targetCurrency).then(
        (data) => {
          if (data) {
            selectedCurrency.value = currency;
            showSelectModal.value = false;
          } else {
            showSelectModal.value = false;
          }
          currency.loading = false;

          context.emit("update:modelValue", selectedCurrency.value.code);
        }
      );
    };

    watch(selectedCurrency, (newCurrency) => {
      showCurrencyImage.value = false;
      context.emit("update:modelValue", newCurrency.code);
      context.emit("update:modelSymbol", newCurrency.symbol);
      setTimeout(() => {
        showCurrencyImage.value = true;
      }, 100);
    });

    watch(defaultCurrencyRef, (newCurrency) => {
      const currencyData = props.availableCurrencies.filter(
        (currency) => currency.code === newCurrency
      );
      selectCurrency(currencyData[0]);
    });

    return {
      selectedCurrency,
      showSelectModal,
      defaultCurrency,
      currencyIsSelected,
      showCurrencyImage,
      selectCurrency,
    };
  },
});
</script>
