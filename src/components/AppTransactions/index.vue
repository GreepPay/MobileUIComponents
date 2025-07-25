<template>
  <div>
    <div v-if="transactions && transactions.length >= 1">
      <div
        class="w-full flex flex-col"
        v-for="transaction in transactions"
        :key="transaction.id"
        @click="Logic.Common.GoToRoute(`/transactions/1`)"
      >
        <div class="w-full flex justify-between py-3">
          <div class="flex items-center space-x-2">
            <app-icon
              :name="getIcon(transaction.type, transaction.status)"
              customClass="!h-12"
            />

            <div class="flex flex-col space-y-[1px]">
              <app-normal-text
                class="!text-left !text-sm !text-black !font-m edium"
              >
                {{ transaction.title }}
              </app-normal-text>

              <span class="flex flex-row space-x-1 items-center">
                <app-normal-text
                  class="!text-sm capitalize text-gray-500"
                  v-if="showType"
                >
                  {{ transaction.type }}
                </app-normal-text>

                <span
                  class="h-[3px] w-[3px] bg-gray-400 rounded-full"
                  v-if="showType"
                >
                </span>

                <app-normal-text class="!text-[11px] text-gray-500">
                  {{ transaction.date }}
                </app-normal-text>
              </span>
            </div>
          </div>

          <app-normal-text class="text-right !text-sm font-semibold">
            {{ transaction.transactionType == "credit" ? "+" : "-" }}
            {{ transaction.amount }} ₺
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

      <div class="w-full flex flex-col pt-4 px-5 items-center justify-center">
        <app-header-text class="text-center w-full !text-xl">
          {{ noDataText }}
        </app-header-text>

        <app-normal-text class="text-center !text-lg !text-gray-two w-full">
          {{ noDataDesc }}
        </app-normal-text>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
  import { defineComponent, PropType } from "vue"
  import AppIcon from "../AppIcon"
  import AppButton from "../AppButton"
  import { AppNormalText, AppHeaderText } from "../AppTypography"
  import { Logic } from "../../composable"

  enum TransactionType {
    Sent = "sent",
    Received = "received",
    Added = "added",
    Redeemed = "redeemed",
  }

  enum TransactionStatus {
    Processing = "processing",
    Failed = "failed",
    Success = "success",
  }
  interface Transaction {
    id: string | number
    title: string
    amount: number
    type: TransactionType
    status: TransactionStatus
    transactionType: "credit" | "debit"
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
      AppButton,
    },
    name: "AppTransaction",
    props: {
      /**
       * The transaction data.
       */
      transactions: {
        type: Array as PropType<Transaction[]>,
        required: true,
      },
      /**
       * Text for no data for transactions
       * @default string
       */
      noDataText: {
        type: String,
        default: "No transactions",
      },
      /**
       * Text for no data for transactions
       * @default string
       */
      noDataDesc: {
        type: String,
        default: "Add Money, Send Money, and Redeem GRP Tokens.",
      },

      showType: {
        type: Boolean,
        default: true,
      },
    },

    setup() {
      const getIcon = (type: TransactionType, status: TransactionStatus) => {
        if (status === "processing") {
          if (type === "sent") return "processing-sent"
          if (type === "received") return "processing-received"
          if (type === "added") return "processing-added"
          if (type === "redeemed") return "processing-redeemed"
        }

        if (status === "failed") {
          if (type === "sent") return "failed-sent"
          if (type === "received") return "failed-received"
          if (type === "added") return "failed-added"
          if (type === "redeemed") return "failed-redeemed"
        }

        //  success state for all transactions types
        if (type === "sent") return "success-sent"
        if (type === "received") return "success-received"
        if (type === "added") return "success-added"
        if (type === "redeemed") return "grp-black"
      }

      return { Logic, getIcon }
    },
  })
</script>
