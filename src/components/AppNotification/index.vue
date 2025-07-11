<template>
  <div
    class="w-full flex flex-row space-x-3 justify-between py-3 !pt-2 border-b-[1.5px] border-[#E0E2E4] mb-3"
  >
    <div class="flex flex-row items-start">
      <div class="w-[50px]">
        <app-icon :name="notification.icon" customClass="!h-[48px]" />
      </div>

      <div class="w-full flex-1 flex flex-col space-y-[3px] ml-2 justify-start">
        <div class="flex items-center justify-between">
          <app-normal-text class="!text-black !font-[500] text-left !text-sm">
            {{ notification.title }}
          </app-normal-text>
          <app-normal-text
            class="!text-gray-two !font-medium !text-right !whitespace-nowrap"
          >
            {{ notification.date }}
          </app-normal-text>
        </div>
        <div class="flex flex-row items-center">
          <template
            v-for="(content, index) in notification.contents"
            :key="index"
          >
            <app-normal-text class="!text-gray-two !text-left !text-sm">
              {{ content }}
            </app-normal-text>
            <template v-if="index < notification.contents.length - 1">
              <span class="h-[4px] w-[4px] rounded-full bg-gray-two mx-2">
              </span>
            </template>
          </template>
        </div>
      </div>
    </div>
    <!-- <div class="flex flex-row justify-end">
      <app-normal-text class="!text-gray-two !text-right !whitespace-nowrap">
        {{ notification.date }}
      </app-normal-text>
    </div> -->
  </div>
</template>

<script lang="ts">
  import { defineComponent } from "vue"
  import AppIcon from "../AppIcon"
  import { AppNormalText } from "../AppTypography"

  /**
   *  Displays a transaction item with its icon, description, date, time, and amount.
   */
  export default defineComponent({
    components: {
      AppIcon,
      AppNormalText,
    },
    name: "AppNotification",
    props: {
      /**
       * The notification data.
       */
      notification: {
        type: Object as () => {
          icon: string
          title: string
          contents: string[]
          date: string
        },
        required: true,
      },
    },

    setup() {
      return {}
    },
  })
</script>
