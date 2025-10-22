<template>
  <div
    class="fixed z-10 flex items-center justify-center bg-green bottom-10 right-4 box-shadow size-12 rounded-full"
  >
    <app-icon :name="icon" custom-class="!h-6" />

    <app-normal-text
      v-if="badge"
      class="absolute !text-green top-2 right-2 text-center bg-white rounded-full !text-[10px] !font-semibold size-4"
    >
      {{ badge }}
    </app-normal-text>
  </div>
</template>

<script lang="ts">
  /**
   * AppFloatingIcon
   *
   * Reusable floating icon button with optional badge.
   */

  import { defineComponent } from "vue"
  import AppIcon from "../AppIcon"
  import { AppNormalText } from "../AppTypography"

  export default defineComponent({
    name: "AppFloatingIcon",
    components: {
      AppIcon,
      AppNormalText,
    },
    props: {
      icon: {
        type: String,
        default: "bag",
      },
      badge: {
        type: [String, Number],
        default: null,
      },
    },
  })
</script>
