<template>
  <div
    :class="[
      'w-full flex justify-between items-center py-2 pb-3 border-b-[1px] border-[#F0F3F6]  ',
      customClass,
    ]"
  >
    <div class="flex items-center space-x-2">
      <div class="w-12">
        <div
          class="h-12 w-12 rounded-full flex justify-center items-center"
          :class="getBgColor(data.type)"
        >
          <app-icon :name="getIcon(data.type)" customClass="!h-5" />
        </div>
      </div>

      <div class="flex flex-col space-y-[1px]">
        <app-normal-text
          class="!text-left !line-clamp-1 !text-black !font-[500] !text-sm"
        >
          {{ data.title }}
        </app-normal-text>

        <span class="flex flex-row space-x-1 items-center">
          <app-normal-text class="!text-[12px] capitalize text-gray-500">
            {{ data.type }}
          </app-normal-text>

          <span class="h-[3px] w-[3px] bg-gray-400 rounded-full"> </span>

          <app-normal-text class="!text-[12px] text-gray-500">
            {{ data.date }}
          </app-normal-text>
        </span>
      </div>
    </div>

    <div class="flex flex-col justify-end pl-1">
      <app-normal-text
        class="text-right !text-sm font-semibold pb-[3px] !whitespace-nowrap"
      >
        {{ data.transactionType == "credit" ? "+" : "-" }}
        {{ getIcon(data.type) == 'grp' ? 'GRP' : data.currencySymbol }}
        {{ Logic.Common.convertToMoney(data.amount, true, "") }}
      </app-normal-text>

      <app-normal-text
        class="!text-[12px] text-gray-500 text-right !whitespace-nowrap"
      >
        {{ data.subAmount }}
      </app-normal-text>
    </div>
  </div>
</template>

<script lang="ts">
  import { defineComponent } from "vue"
  import AppIcon from "../AppIcon"
  import { AppNormalText } from "../AppTypography"
  import { Logic } from "../../composable"

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
    name: "AppTransaction",
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
          currencySymbol?: string
          subAmount?: string
        },
        required: true,
      },

      customClass: {
        type: String,
        default: "",
      },
    },

    setup() {
      const getIcon = (type: TransactionType) => {
        if (type === "sent") return "white-arrow-up"
        if (type === "received") return "white-arrow-down"
        if (type === "added") return "white-plus"
        if (type === "redeemed") return "grp"
        return "text-gray-500"
      }

      const getBgColor = (type: string) => {
        if (type === "sent") return "!bg-[#00A0B4]"
        if (type === "received") return "!bg-[#10BB76]"
        if (type === "added") return "!bg-[#8E3BE0]"
        if (type === "redeemed") return "!bg-[#0A141E]"
        return "!bg-gray-100"
      }

      return {
        getBgColor,
        getIcon,
        Logic,
      }
    },
  })
</script>
