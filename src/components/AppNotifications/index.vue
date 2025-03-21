<template>
  <div>
    <div v-if="notifications && notifications.length >= 1">
      <div class="w-full flex flex-col space-y-3">
        <div
          class="w-full flex space-x-3 py-4 px-6 border-b"
          v-for="notification in notifications"
          :key="notification.id"
        >
          <div class="flex flex-1 items-center space-x-2">
            <app-icon
              :name="getIcon(notification.type)"
              custom-class="size-12"
            />

            <div class="flex-1 flex flex-col space-y-[1px]">
              <app-header-text class="!text-left !text-lg !text-black">
                {{ notification.title }}
              </app-header-text>

              <app-normal-text class="!text-sm capitalize !text-gray-2">
                {{ notification.description }}
              </app-normal-text>
            </div>
          </div>

          <app-normal-text class="!text-sm !text-gray-2">
            {{ notification.date }}
          </app-normal-text>
        </div>
      </div>
    </div>

    <!-- No data option -->
    <div
      v-else
      class="border flex flex-col items-center justify-center rounded-2xl py-8 px-6"
    >
      <app-icon name="bulk-receipt-add" custom-class="size-14" />

      <app-normal-text class="text-center !text-lg !text-gray-two w-full">
        {{ noDataText }}
      </app-normal-text>
    </div>
  </div>
</template>

<script lang="ts">
  import { defineComponent, PropType } from "vue"
  import AppIcon from "../AppIcon"
  import { AppNormalText, AppHeaderText } from "../AppTypography"

  enum TransactionType {
    Success = "success",
    Failed = "failed",
    Info = "info",
  }

  interface Notification {
    id: string | number
    title: string
    description: string
    type: TransactionType
    date: string
  }
  /**
   *  Displays a transaction item with its icon, description, date, time, and amount.
   */
  export default defineComponent({
    components: {
      AppIcon,
      AppNormalText,
      AppHeaderText,
    },
    name: "AppNotifications",
    props: {
      /**
       * The transaction data.
       */

      notifications: {
        type: Array as PropType<Notification[]>,
        required: true,
      },
      /**
       * Text for no data for notifications
       * @default string
       */
      noDataText: {
        type: String,
        default: "No Notifications available",
      },
    },

    setup() {
      const getIcon = (type: TransactionType) => {
        if (type === "success") return "success-check"
        if (type === "failed") return "close-red-bg"
        else return "info"
      }

      return {
        getIcon,
      }
    },
  })
</script>
