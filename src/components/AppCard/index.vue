<template>
  <div
    :class="`rounded-lg overflow-hidden ${
      elevation ? 'shadow-' + elevation : ''
    } ${customClass}`"
  >
    <div v-if="$slots.media" class="w-full">
      <slot name="media" />
    </div>

    <div v-if="$slots.header" :class="`px-4 py-3 ${headerClass}`">
      <slot name="header" />
    </div>

    <div :class="`px-4 py-3 ${contentClass}`">
      <slot />
    </div>

    <div v-if="$slots.footer" :class="`px-4 py-3 ${footerClass}`">
      <slot name="footer" />
    </div>
  </div>
</template>

<script lang="ts">
  import { defineComponent } from "vue"

  /**
   * Card Component
   *
   * A flexible and extensible content container
   */
  export default defineComponent({
    name: "AppCard",
    props: {
      /**
       * Shadow elevation level (1-5)
       */
      elevation: {
        type: Number,
        default: 1,
        validator: (value: number) => value >= 0 && value <= 5,
      },
      /**
       * Custom class for the card container
       */
      customClass: {
        type: String,
        default: "",
      },
      /**
       * Custom class for the header section
       */
      headerClass: {
        type: String,
        default: "",
      },
      /**
       * Custom class for the content section
       */
      contentClass: {
        type: String,
        default: "",
      },
      /**
       * Custom class for the footer section
       */
      footerClass: {
        type: String,
        default: "",
      },
    },
  })
</script>
