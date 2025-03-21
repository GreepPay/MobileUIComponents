<template>
  <div class="w-full flex justify-between items-center py-2">
    <div class="flex items-center space-x-2">
      <div
        class="h-12 w-12 rounded-full flex justify-center items-center"
        :class="getBgColor(data.type)"
      >
        <app-icon :name="getIcon(data.type)" customClass="!h-5" />
      </div>

      <div class="flex flex-col space-y-[1px]">
        <app-normal-text
          class="!text-left !line-clamp-1 !text-black !font-medium"
        >
          {{ data.title }}
        </app-normal-text>

        <span class="flex flex-row space-x-1 items-center">
          <app-normal-text class="!text-[11px] capitalize text-gray-500">
            {{ data.type }}
          </app-normal-text>

          <span class="h-[3px] w-[3px] bg-gray-400 rounded-full"> </span>

          <app-normal-text class="!text-[11px] text-gray-500">
            {{ data.date }}
          </app-normal-text>
        </span>
      </div>
    </div>

    <app-normal-text class="text-right !text-sm font-semibold">
      {{ data.transactionType == "credit" ? "+" : "-" }} {{ data.amount }} ₺
    </app-normal-text>
  </div>
</template>

<script lang="ts">
  import { defineComponent } from "vue"
  import AppIcon from "../AppIcon"
  import { AppNormalText } from "../AppTypography"

  enum TransactionType {
    Sent = "sent",
    Received = "received",
    Added = "added",
    Redeemed = "redeemed",
  }

  /**
   *  Displays a transaction item with its icon, description, date, time, and amount.
   */
  export default defineComponent({
    components: {
      AppIcon,
      AppNormalText,
    },
    name: "AppPaymentMethods",
    props: {
      /**
       * The transaction data.
       */
      data: {
        type: Object as () => {
          id: string | number
          title: string
          amount: number
          type: TransactionType
          transactionType: "credit" | "debit"
          date: string
        },
        required: true,
      },
    },

    setup() {
      const getIcon = (type: TransactionType) => {
        if (type === "sent") return "white-arrow-down"
        if (type === "received") return "white-arrow-up"
        if (type === "added") return "white-plus"
        if (type === "redeemed") return "grp"
        return "text-gray-500"
      }

      const getBgColor = (type) => {
        if (type === "sent") return "!bg-[#00A0B4]"
        if (type === "received") return "!bg-[#10BB76]"
        if (type === "added") return "!bg-[#8E3BE0]"
        if (type === "redeemed") return "!bg-[#0A141E]"
        return "!bg-gray-100"
      }

      return {
        getBgColor,
        getIcon,
      }
    },
  })
</script>
