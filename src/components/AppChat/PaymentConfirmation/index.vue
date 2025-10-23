<template>
  <div
    v-if="isOpen && !paymentConfirmed"
    class="w-full flex flex-row items-center justify-between"
  >
    <div class="w-full flex flex-row justify-start">
      <app-normal-text class="!whitespace-nowrap"> Deadline </app-normal-text>
      <div class="px-2">
        <app-countdown-timer
          :duration="countdownSeconds"
          customText=""
          format="hh:mm:ss"
          customClass="!bg-transparent !border-0 !h-auto !p-0 !text-green-500 !font-semibold !text-sm"
          @expired="handleExpired"
        />
      </div>
    </div>
    <app-button
      :disabled="isProcessing"
      variant="secondary"
      @click="handleConfirmPayment"
      class="!whitespace-nowrap !py-3"
    >
      Confirm Payment
    </app-button>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { AppCountdownTimer } from "../../../index";
import { AppNormalText } from "../../AppTypography";
import AppButton from "../../AppButton";

export default defineComponent({
  name: "PaymentConfirmation",
  components: {
    AppCountdownTimer,
    AppNormalText,
    AppButton,
  },
  props: {
    isOpen: {
      type: Boolean,
      default: false,
    },
    paymentConfirmed: {
      type: Boolean,
      default: false,
    },
    isBusinessUser: {
      type: Boolean,
      default: false,
    },
    countdownSeconds: {
      type: Number,
      default: 14400, // 4 hours
    },
    isProcessing: {
      type: Boolean,
      default: false,
    },
    orderTotal: {
      type: Number,
      default: 0,
    },
    currency: {
      type: String,
      default: "USDC",
    },
  },
  emits: ["confirm", "close"],
  setup(props, { emit }) {
    const handleConfirmPayment = () => {
      emit("confirm");
    };

    const handleExpired = () => {
      emit("close");
    };

    return {
      handleConfirmPayment,
      handleExpired,
    };
  },
});
</script>
