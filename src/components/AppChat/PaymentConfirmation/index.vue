<template>
  <div v-if="isOpen && !paymentConfirmed && !isBusinessUser" class="payment-confirmation-inline">
    <div class="deadline">
      <div class="label">Deadline</div>
      <div class="time">
        <app-countdown-timer :duration="countdownSeconds" customText="" format="hh:mm:ss"
          customClass="!bg-transparent !border-0 !h-auto !p-0 !text-green-500 !font-bold !text-lg"
          @expired="handleExpired" />
      </div>
    </div>
    <button @click="handleConfirmPayment" class="pill-outline" :disabled="isProcessing">
      Payment confirmed
    </button>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { AppCountdownTimer } from '../../../index';

export default defineComponent({
  name: 'PaymentConfirmation',
  components: {
    AppCountdownTimer,
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
      default: 'USDC',
    },
  },
  emits: ['confirm', 'close'],
  setup(props, { emit }) {
    const handleConfirmPayment = () => {
      emit('confirm');
    };

    const handleExpired = () => {
      emit('close');
    };

    return {
      handleConfirmPayment,
      handleExpired,
    };
  },
});
</script>

<style scoped>
/* Inline pill style confirmation (matches provided screenshot) */
.payment-confirmation-inline {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 12px 4px;
}

.payment-confirmation-inline .deadline {
  display: flex;
  flex-direction: column;
}

.payment-confirmation-inline .label {
  color: #9ca3af;
  /* gray-400 */
  font-weight: 600;
}

.payment-confirmation-inline .time {
  color: #10b981;
  /* green-500 */
  font-weight: 700;
  font-size: 18px;
}

.pill-outline {
  border: 2px solid #059669;
  /* green-600 */
  color: #059669;
  background: white;
  padding: 12px 20px;
  border-radius: 9999px;
  font-weight: 600;
  transition: all 0.3s ease;
}

.pill-outline:hover:not(:disabled) {
  background: #059669;
  color: white;
}

.pill-outline:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>