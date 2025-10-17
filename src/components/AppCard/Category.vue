<template>
  <div
    class="flex flex-col items-center justify-center space-y-1 w-14 shrink-0"
  >
    <app-avatar :src="item.image" :size="56" />
    <app-normal-text
      class="!text-gray-two !leading-6 text-center truncate w-full px-1"
    >
      {{ item.label }}
    </app-normal-text>
  </div>
</template>

<script lang="ts">
  /**
   * AppCategoryItem
   *
   * Reusable component for horizontal category icons with labels.
   */

  import { defineComponent } from "vue"
  import AppAvatar from "../AppAvatar"
  import { AppNormalText } from "../AppTypography"

  interface CategoryAvatar {
    label: string
    image: string
  }
  export default defineComponent({
    name: "AppCategoryCard",
    components: {
      AppAvatar,
      AppNormalText,
    },
    props: {
      item: {
        type: Object as () => CategoryAvatar,
        required: true,
      },
    },
  })
</script>
