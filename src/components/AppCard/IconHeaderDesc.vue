<template>
  <div class="bg-white flex items-center flex-1">
    <app-icon :name="iconName" :custom-class="iconSize" />

    <div class="ml-3 gap-4 bg-white">
      <app-normal-text customClass="leading-6 !text-xxs !text-black  ">
        {{ title }}
      </app-normal-text>
      <app-header-text customClass="leading-6   !text-sm !text-black  ">
        {{ description }}
      </app-header-text>
    </div>
  </div>
</template>

<script lang="ts">
  /**
   * AppCouponCard
   */
  import { defineComponent } from "vue"
  import AppIcon from "../AppIcon"
  import { AppHeaderText, AppNormalText } from "../AppTypography"

  export default defineComponent({
    name: "AppIconHeaderDescnCard",
    components: { AppHeaderText, AppNormalText, AppIcon },
    props: {
      title: {
        type: String,
        default: "",
      },
      description: {
        type: String,
        default: "",
      },
      iconName: {
        type: String,
        default: "",
      },
      iconSize: {
        type: String,
        default: "",
      },
      /**
       * Optional custom Tailwind classes (e.g. !bg-green)
       */
      customClass: {
        type: String,
        default: "",
      },
    },

    setup() {
      return {}
    },
  })
</script>
