<template>
  <div
    class="flex flex-row items-start py-3 !pt-2 border-b-[1.5px] border-[#E0E2E4] mb-3"
    @click="emit('click', notification)"
  >
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
            <span class="h-[4px] w-[4px] rounded-full bg-gray-two mx-2"> </span>
          </template>
        </template>
      </div>
    </div>
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
          id: number
          type: string
          icon: string
          is_read: boolean
          title: string
          contents: string[]
          date: string
        },
        required: true,
      },
      isSelected: {
        type: Boolean,
        default: false,
      },
    },

    emits: ["click"],
    setup(props, { emit }) {
      return { emit }
    },
  })
</script>
