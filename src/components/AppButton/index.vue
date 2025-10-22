<template>
  <button :class="[customClass, buttonClass]" :disabled="disabled || loading">
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
import { defineComponent, PropType, computed, onMounted } from "vue";

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
        "primary" | "secondary" | "danger" | "primary-white" | "text"
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

    ignoreButtonClass: {
      type: Boolean,
      default: false,
    },
  },

  setup(props) {
    const buttonClass = computed(() => {
      if (props.ignoreButtonClass) {
        return "";
      }
      const classList: string[] = [];

      // Base classes
      classList.push(
        "relative",
        "flex",
        "items-center",
        "justify-center",
        "gap-2",
        "px-4",
        "py-2",
        "transition-all",
        "duration-300",
        "ease-in-out"
      );

      // Shape
      if (props.iconOnly) {
        classList.push("rounded-full", "p-2", "w-10", "h-10");
      } else {
        classList.push("rounded-[40px]");
      }

      // Outlined + Variant logic
      if (props.outlined) {
        classList.push("bg-transparent", "border");

        if (props.variant === "primary") {
          classList.push(
            "border-primary",
            "text-primary",
            "hover:bg-primary/10"
          );
        }
        if (props.variant === "secondary") {
          classList.push(
            "border-secondary",
            "text-secondary",
            "hover:bg-secondary/10"
          );
        }
        if (props.variant === "danger") {
          classList.push("border-red", "text-red", "hover:bg-red/10");
        }
        if (props.variant === "primary-white") {
          classList.push("border-white", "text-white", "hover:bg-white/10");
        }
        if (props.variant === "text") {
          classList.push(
            "border-primary",
            "text-primary",
            "hover:bg-primary/10"
          );
        }
      } else {
        if (props.variant === "primary") {
          classList.push(
            "bg-primary",
            "text-white",
            "border",
            "border-primary",
            "hover:bg-primary/90"
          );
        }
        if (props.variant === "secondary") {
          classList.push(
            "bg-secondary",
            "text-white",
            "border",
            "border-secondary",
            "hover:bg-secondary/90"
          );
        }
        if (props.variant === "danger") {
          classList.push(
            "bg-red",
            "text-white",
            "border",
            "border-red-900",
            "hover:bg-red/90"
          );
        }
        if (props.variant === "primary-white") {
          classList.push(
            "bg-white",
            "text-primary",
            "border",
            "border-white",
            "hover:bg-white/90"
          );
        }
        if (props.variant === "text") {
          classList.push(
            "bg-transparent",
            "text-primary",
            "hover:bg-primary/10"
          );
        }
      }

      // Disabled
      if (props.disabled) {
        classList.push("opacity-40", "cursor-not-allowed");
      } else {
        classList.push("cursor-pointer");
      }

      return classList.join(" ");
    });

    return {
      buttonClass,
    };
  },
});
</script>
