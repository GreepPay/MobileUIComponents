<template>
  <span
    :class="`items-center
  ${customClass} ${color}
  ${size == 'base' ? 'lg:text-sm mdlg:text-[12px] text-xs' : ''}
  ${size == 'small' ? ' text-xs' : ''}`"
  >
    <!--
      @slot Default slot for text content.
    -->
    <slot v-if="!isHtml" />
    <template v-else>
      <span v-html="htmlContent" :class="`${customClass}`"> </span>
    </template>
  </span>
</template>
<script lang="ts">
/**
 * Normal Text component for displaying text with configurable size, color, and custom classes.
 */
import { defineComponent } from "vue";
export default defineComponent({
  props: {
    /**
     * Size of the text.
     * @values 'base', 'small'
     * @default 'base'
     */
    size: {
      type: String,
      default: "base",
      validator: (value: string) => ["base", "small"].includes(value),
    },
    /**
     * Color of the text.  Uses TailwindCSS text color classes (e.g., 'text-black', 'text-gray-500').
     * @default 'text-black'
     */
    color: {
      type: String,
      default: "text-black",
    },
    /**
     * Custom CSS class(es) to apply to the text.
     * @default ''
     */
    customClass: {
      type: String,
      default: "",
    },
    /**
     * Determines if the text content should be rendered as HTML.
     * If true, the `htmlContent` prop will be used.
     * @default false
     */
    isHtml: {
      type: Boolean,
      default: false,
    },
    /**
     * The HTML content to render if `isHtml` is true.
     * @default ''
     */
    htmlContent: {
      type: String,
      default: "",
    },
  },
  name: "AppNormalText",
});
</script>
