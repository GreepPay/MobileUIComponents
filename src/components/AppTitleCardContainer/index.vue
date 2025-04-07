<template>
  <app-image-loader
    :class="[
      'w-full h-fit rounded-[35px] flex flex- col relative justify-center items-center space-y-5  xs:!py-4 bg-[linear-gradient(359.13deg,#10BB76_25.37%,#008651_99.25%)]',
      customClass,
    ]"
    :photoUrl="''"
  >
    <!-- Image bg -->
    <img
      src="/images/greep-transparent-logo.svg"
      class="h-full absolute w-full top-0 left-0 rounded-[35px] z-[1]"
    />

    <div class="z-50 w-full h-full px-5 py-5">
      <slot />
    </div>
  </app-image-loader>
</template>

<script lang="ts">
  import { defineComponent } from "vue"
  import AppImageLoader from "../AppImageLoader"
  /**
   * Title Card Container
   *
   * This component renders a stylized card with a background image of a logo
   * and an optional gradient overlay. It allows custom content through the default slot,
   * making it flexible for different use cases.
   *
   * Features:
   * - Background logo image.
   * - Gradient overlay for styling enhancement.
   * - Supports dynamic content via slot.
   * - Customizable through props.
   *
   * @slot Default slot for header text content.
   */
  export default defineComponent({
    name: "AppTitleCardContainer",
    components: {
      AppImageLoader,
    },
    props: {
      /**
       *  Allows to add custom classes the container.
       *  @default ""
       */
      customClass: {
        type: String,
        default: "",
      },
    },
  })
</script>
