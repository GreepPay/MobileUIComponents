<template>
  <div
    v-if="show"
    class="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-end"
  >
    <div
      class="w-full bg-white rounded-t-3xl max-h-[90vh] overflow-y-auto shadow-2xl border-t border-gray-200"
      @click.stop
    >
      <div class="p-4 pb-4">
        <!-- Header -->

        <div class="flex items-center justify-between mb-4">
          <div class="flex items-center space-x-2">
            <app-header-text class="!text-base">
              Choose Payment Method
            </app-header-text>
          </div>

          <div class="w-[28px] h-[28px]">
            <app-icon name="close" custom-class="h-[22px]" />
          </div>
        </div>

        <!-- Payment Methods -->
        <div class="w-full flex flex-col">
          <template v-if="loadingMethods">
            <div
              class="w-full flex flex-col items-center justify-center py-20 h-[100px]"
            >
              <app-normal-text class="text-gray-500 text-center mb-2">
                Loading payment methods...
              </app-normal-text>
            </div>
          </template>
          <template
            v-for="(method, index) in PaymentMethods?.data"
            :key="index"
          >
            <div
              class="w-full flex flex-row items-center justify-between mb-5 p-4 border border-gray-200 rounded-lg"
              @click="selectMethod(method)"
            >
              <div class="w-full flex flex-row space-x-3 items-start">
                <app-icon name="wallet-grey" custom-class="h-[24px] mt-1" />

                <div class="flex flex-col space-y-1">
                  <app-normal-text class="!text-left font-semibold">
                    {{ method.account_name }}
                  </app-normal-text>
                  <app-normal-text class="!text-left text-sm text-gray-600">
                    {{ method.bank_name }}
                  </app-normal-text>
                  <app-normal-text class="!text-left text-sm text-gray-500">
                    {{ method.account_number }} • {{ method.currency }}
                  </app-normal-text>
                </div>
              </div>
            </div>
          </template>
        </div>

        <div class="w-full flex flex-col pt-4 pb-4"></div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, onMounted, reactive, ref } from "vue";
import { availableCurrencies, Logic } from "../../../composable";
import AppIcon from "../../AppIcon";
import { AppHeaderText, AppNormalText } from "../../AppTypography";
import AppButton from "../../AppButton";
import { P2pPaymentMethod } from "@greep/logic/src/gql/graphql";

export default defineComponent({
  name: "ChatPaymentMethods",
  components: {
    AppIcon,
    AppHeaderText,
    AppNormalText,
    AppButton,
  },
  props: {
    show: {
      type: Boolean,
      default: false,
    },
  },
  emits: ["cancel", "method-selected"],
  setup(props, { emit }) {
    const PaymentMethods = ref(Logic.Wallet.ManyP2pPaymentMethods);

    const loadingMethods = ref(true);

    const loadMethods = async () => {
      const currencyInfo = availableCurrencies.find(
        (currency) =>
          currency.code ===
          Logic.Messaging?.SingleConversation?.exchangeAd?.from_currency
      );
      await Logic.Wallet.GetMyP2pPaymentMethods(
        20,
        1,
        "CREATED_AT",
        "DESC",
        `{
        column: CURRENCY,
        operator: EQ,
        value: "${Logic.Messaging?.SingleConversation?.exchangeAd?.from_currency}_${currencyInfo?.country_code}"
        }`
      );
      loadingMethods.value = false;
    };

    const selectMethod = (method: P2pPaymentMethod) => {
      emit("method-selected", method);
    };

    onMounted(() => {
      loadMethods();
      Logic.Wallet.watchProperty("ManyP2pPaymentMethods", PaymentMethods);
    });

    return {
      PaymentMethods,
      loadingMethods,
      selectMethod,
    };
  },
});
</script>
