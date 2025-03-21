<template>
  <button
    :class="[
      'relative flex items-center justify-center gap-2 px-4 py-2 transition-all duration-300 ease-in-out font-medium text-base',
      iconOnly ? 'rounded-full  !p-0  w-12 h-12' : 'rounded-[40px]',
      outlined
        ? 'bg-transparent border'
        : variant === 'primary'
        ? 'bg-primary text-white border border-primary'
        : variant === 'secondary'
        ? 'bg-secondary text-white border border-secondary'
        : variant === 'danger'
        ? 'bg-red text-white border border-red'
        : variant === 'primary-white'
        ? 'bg-white text-primary border border-white'
        : '!bg-transparent text-primary',
      outlined && variant === 'primary'
        ? 'border-primary text-primary hover:bg-primary/10'
        : outlined && variant === 'secondary'
        ? '!border-secondary text-secondary hover:bg-secondary/10'
        : outlined && variant === 'danger'
        ? '!border-red text-red hover:bg-red/10'
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
    <div v-if="loading" class="absolute left-1/2 -translate-x-1/2">
      <!-- <img
        src="@/assets/svg/All/linear/refresh-2.svg"
        class="w-5 h-5 animate-spin"
        :class="{'opacity-40': disabled}"
      /> -->
    </div>

    <template v-if="!loading">
      <slot name="icon" />
      <slot v-if="!iconOnly" />
    </template>
  </button>
</template>

<script lang="ts">
  import { defineComponent, PropType } from "vue"

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
        default: "secondary",
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
    },
  })
</script>
