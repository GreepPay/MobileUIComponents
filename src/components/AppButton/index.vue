<template>
  <button
    :class="[
      'relative flex items-center justify-center gap-2 px-4 py-2 transition-all duration-300 ease-in-out',
      iconOnly ? 'rounded-full p-2 w-10 h-10' : 'rounded-[40px]',

      outlined
        ? 'bg-transparent border'
        : variant === 'primary'
        ? 'bg-primary text-white border border-primary'
        : variant === 'secondary'
        ? 'bg-secondary text-white border border-secondary'
        : variant === 'primary-white'
        ? 'bg-white text-primary border border-white'
        : 'bg-transparent text-primary',
      outlined && variant === 'primary'
        ? 'border-primary text-primary hover:bg-primary/10'
        : outlined && variant === 'secondary'
        ? 'border-secondary text-secondary hover:bg-secondary/10'
        : outlined && variant === 'primary-white'
        ? 'border-white text-white hover:bg-white/10'
        : outlined && variant === 'text'
        ? 'border-primary text-primary hover:bg-primary/10'
        : variant === 'primary'
        ? 'hover:bg-primary/90'
        : variant === 'secondary'
        ? 'hover:bg-secondary/90'
        : variant === 'primary-white'
        ? 'hover:bg-white/90'
        : 'hover:bg-primary/10',
      disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer',
      customClass,
    ]"
    :disabled="disabled || loading"
  >
    <span v-if="loading">
      <svg
        :class="`animate-spin  h-5 w-5  ${loadingClass} `"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          class="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          stroke-width="4"
        ></circle>
        <path
          class="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        ></path>
      </svg>
    </span>
    <template v-if="!loading">
      <slot name="icon" />
      <slot v-if="!iconOnly" />
    </template>
  </button>
</template>

<script lang="ts">
import { defineComponent, PropType } from "vue";

/**
 *  Button Component
 *
 *  This component is a reusable button with customizable styling.
 */

export default defineComponent({
  props: {
    /**
     * The variant style to apply to the button.
     * @values 'primary' | 'secondary' | 'primary-white' | 'text'
     */
    variant: {
      type: String as PropType<
        "primary" | "secondary" | "primary-white" | "text"
      >,
      default: "primary",
      validator: (value: string) =>
        ["primary", "secondary", "primary-white", "text"].includes(value),
    },
    /**
     * Whether to show the button in outlined style
     */
    outlined: {
      type: Boolean,
      default: false,
    },
    /**
     * Whether the button is disabled
     */
    disabled: {
      type: Boolean,
      default: false,
    },
    /**
     * Whether to show a loading spinner
     */
    loading: {
      type: Boolean,
      default: false,
    },
    /**
     * Custom CSS classes to apply to the button
     */
    customClass: {
      type: String,
      default: "",
    },
    /**
     * Whether the button should be rounded
     */
    rounded: {
      type: Boolean,
      default: true,
    },
    /**
     * If true, the button will only contain an icon and will be fully rounded
     */
    iconOnly: {
      type: Boolean,
      default: false,
    },

    /**
     * Custom CSS classes to apply to the loading spinner
     */
    loadingClass: {
      type: String,
      default: "text-white",
    },
  },
});
</script>
