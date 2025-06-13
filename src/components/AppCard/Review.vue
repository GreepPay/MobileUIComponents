<template>
  <div class="w-full bg-white py-3 border-t">
    <div class="flex items-center justify-between mb-1">
      <app-header-text customClass="leading-6 !text-sm !text-black">
        {{ review.name }}
      </app-header-text>

      <div class="flex items-center truncate">
        <app-icon name="star-orange" class="!text-white !size-4 -mt-1" />
        <app-normal-text
          customClass="!text-xxs !font-semibold !text-black pl-1.5"
        >
          {{ review.rating }}
        </app-normal-text>
        <span class="text-veryLightGray px-1.5">●</span>
        <app-normal-text
          customClass="!text-xxs !font-medium !text-veryLightGray"
        >
          {{ review.date }}
        </app-normal-text>
      </div>
    </div>

    <app-normal-text customClass="leading-6 !text-xxs !text-gray-two">
      {{ review.text }}
    </app-normal-text>
  </div>
</template>

<script lang="ts">
  /**
   * AppReviewCard
   *
   * Reusable review display card showing name, rating, date, and comment.
   */

  import { defineComponent } from "vue"
  import AppIcon from "../AppIcon"
  import { AppHeaderText, AppNormalText } from "../AppTypography"

  export default defineComponent({
    name: "AppReviewCard",
    components: {
      AppIcon,
      AppHeaderText,
      AppNormalText,
    },
    props: {
      review: {
        type: Object as () => {
          name: string
          rating: number | string
          date: string
          text: string
        },
        required: true,
      },
    },
  })
</script>
