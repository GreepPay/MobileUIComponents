<template>
  <div
    :class="[
      '  w-full bg-[#F0F3F6] h-14 flex items-center justify-center rounded-[40px]  text-sm font-medium',
      customClass,
    ]"
  >
    <app-normal-text customClass="!text-[#999999]" v-if="timeLeft">
      {{ customText }} for {{ formattedTime }}
    </app-normal-text>

    <app-normal-text customClass="!text-[#999999]  cursor-not-allowed" v-else>
      Expired
    </app-normal-text>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, onMounted, onUnmounted } from "vue";
import { AppNormalText } from "../AppTypography";

/**
 * Countdown Timer Component
 *
 * This component displays a countdown timer in the format "Available for MM:SS"
 * and emits an "expired" event when the countdown reaches zero.
 *
 * Features:
 * - Dynamic countdown with live updates.
 * - Emits an event when the timer expires.
 * - Customizable styles via props.
 *
 * Props:
 * @prop {Number} duration - The countdown duration in seconds.
 * @prop {String} customClass - Additional classes for styling (optional).
 *
 * Events:
 * @event expired - Emitted when the countdown reaches zero.
 */
export default defineComponent({
  name: "AppCountdownTimer",
  components: { AppNormalText },
  props: {
    /**
     * Countdown duration in seconds.
     * @required
     */
    duration: {
      type: Number,
      default: 600,
    },
    /**
     * Countdown duration in seconds.
     * @required
     */
    customText: {
      type: String,
      default: "Available",
    },
    /**
     * Custom class for styling.
     * @default ""
     */
    customClass: {
      type: String,
      default: "",
    },
  },
  emits: ["expired"],
  setup(props, { emit }) {
    const timeLeft = ref(props.duration);
    let timer: number | null = null;

    const formattedTime = computed(() => {
      const minutes = Math.floor(timeLeft.value / 60);
      const seconds = timeLeft.value % 60;
      return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(
        2,
        "0"
      )}`;
    });

    const startCountdown = () => {
      timer = setInterval(() => {
        if (timeLeft.value > 0) {
          timeLeft.value--;
        } else {
          clearInterval(timer as number);
          emit("expired"); // Emit when countdown ends
        }
      }, 1000);
    };

    onMounted(startCountdown);

    onUnmounted(() => {
      if (timer) clearInterval(timer);
    });

    return { formattedTime, timeLeft };
  },
});
</script>
