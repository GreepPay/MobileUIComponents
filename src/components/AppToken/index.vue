<template>
  <div class="w-full flex justify-between items-center py-2 pb-3 min-w-full">
    <!-- Left Section: Icon + Texts -->
    <div class="flex items-center space-x-2">
      <!-- Avatar/Icon -->
      <div class="h-12 w-12 rounded-full flex justify-center items-center">
        <app-icon name="grp-white-green" :custom-class="iconClass" />
      </div>

      <!-- Label + Timestamp -->
      <div class="flex flex-col space-y-[1px]">
        <app-normal-text
          class="!text-left !line-clamp-1 !text-black !font-[500] !text-sm"
        >
          {{ token.title }}
        </app-normal-text>

        <app-normal-text class="!text-[12px] capitalize text-gray-500">
          {{ token.timestamp }}
        </app-normal-text>
      </div>
    </div>

    <!-- Right-Aligned Info -->
    <app-normal-text class="text-right !text-sm font-medium">
      {{ ` ${token.is_debit ? "-" : "+"} ${token.amount}` }}
    </app-normal-text>
  </div>
</template>

<script lang="ts">
  /**
   * AppTokenItem
   *
   * A reusable item for listing recent activities, rewards, or events.
   * Includes an icon, a main title, subtitle, and right-aligned info.
   */

  import { defineComponent } from "vue"
  import AppIcon from "../AppIcon"
  import { AppNormalText } from "../AppTypography"

  export default defineComponent({
    name: "AppTokenItem",
    components: {
      AppIcon,
      AppNormalText,
    },
    props: {
      token: {
        type: Object as () => {
          title: String
          amount: String
          is_debit: Boolean
          timestamp: String
        },
        required: true,
      },
      iconClass: {
        type: String,
        default: "!h-12",
      },
    },
  })
</script>
