<template>
  <div
    :class="[
      '  w-full bg-[#F0F3F6] h-14 flex items-center justify-center rounded-[40px]  text-sm font-medium',
      customClass,
    ]"
  >
    <app-normal-text customClass="!text-[#999999]" v-if="timeLeft">
      {{ customText }}
      <span class="!text-[#00683F] !font-semibold" v-if="!almostDone">{{
        formattedTime
      }}</span>
      <span class="!text-[#D71E0F] !font-semibold" v-else>{{
        formattedTime
      }}</span>
    </app-normal-text>

    <app-normal-text customClass="!text-[#999999]  cursor-not-allowed" v-else>
      Expired
    </app-normal-text>
  </div>
</template>

<script lang="ts">
import {
  defineComponent,
  ref,
  computed,
  onMounted,
  onUnmounted,
  watch,
} from "vue";
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
      default: "Available for",
    },
    /**
     * Time format: 'mm:ss' or 'hh:mm:ss'
     * @default "auto" (auto-detects based on duration)
     */
    format: {
      type: String,
      default: "auto",
      validator: (value: string) =>
        ["mm:ss", "hh:mm:ss", "auto"].includes(value),
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
      const hours = Math.floor(timeLeft.value / 3600);
      const minutes = Math.floor((timeLeft.value % 3600) / 60);
      const seconds = timeLeft.value % 60;

      // Determine format to use
      let useFormat = props.format;
      if (useFormat === "auto") {
        useFormat = timeLeft.value >= 3600 ? "hh:mm:ss" : "mm:ss";
      }

      if (useFormat === "hh:mm:ss") {
        return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(
          2,
          "0",
        )}:${String(seconds).padStart(2, "0")}`;
      } else {
        // mm:ss format
        const totalMinutes = Math.floor(timeLeft.value / 60);
        return `${String(totalMinutes).padStart(2, "0")}:${String(
          seconds,
        ).padStart(2, "0")}`;
      }
    });

    const almostDone = computed(() => timeLeft.value <= 60);
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

    // Watch for duration changes and reset timer
    watch(
      () => props.duration,
      (newDuration) => {
        if (timer) {
          clearInterval(timer);
          timer = null;
        }
        timeLeft.value = newDuration;
        startCountdown();
      },
    );

    onMounted(startCountdown);

    onUnmounted(() => {
      if (timer) clearInterval(timer);
    });

    return { formattedTime, timeLeft, almostDone };
  },
});
</script>
