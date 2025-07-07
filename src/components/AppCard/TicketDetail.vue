<template>
  <div class="flex w-full min-h-36 relative" :class="customClass">
    <!-- Main Ticket Body -->
    <div class="!w-3/4 bg-[#D9D9D9] flex flex-col justify-between p-4">
      <div class="w-full flex flex-col">
        <app-header-text customClass="!text-black !text-base">
          Ticket ID: {{ ticket.saleId }}
        </app-header-text>
        <app-normal-text customClass="!text-gray-two !font-medium !text-sm">
          Status: {{ ticket.status }}
        </app-normal-text>
      </div>

      <app-header-text customClass="!text-black !text-base">
        ${{ ticket.price.toFixed(2) }}
      </app-header-text>
    </div>

    <!-- Ticket Type -->
    <div
      class="w-1/4 flex justify-center items-center"
      :class="attributeBgColor"
    >
      <app-header-text customClass="!text-white !text-xl vertical-rl">
        {{ ticket.ticketType }}
      </app-header-text>
    </div>

    <!-- Dotted Cutout -->
    <div
      class="absolute h-full -mr-2.5 right-1/4 rounded-full size-5 flex flex-col justify-between"
    >
      <span class="block size-5 bg-white rounded-full -mt-2.5"></span>
      <span class="block size-5 bg-white rounded-full -mb-2.5"></span>
    </div>
  </div>
</template>

<script lang="ts">
  import { defineComponent, computed } from "vue"
  import { AppHeaderText, AppNormalText } from "../AppTypography"
  import { Ticket } from "@greep/logic/src/gql/graphql"

  enum BgColor {
    Green = "bg-green",
    Purple = "bg-purple",
    Orange = "bg-orange",
    DarkGreen = "bg-dark-green",
    Blue = "bg-blue",
    BlueGreen = "bg-blue-green",
    Gray = "bg-gray",
  }

  export default defineComponent({
    name: "AppTicketCard",
    components: {
      AppHeaderText,
      AppNormalText,
    },
    props: {
      ticket: {
        type: Object as () => Ticket,
        required: true,
      },
      customClass: {
        type: String,
        default: "",
      },
    },
    setup(props) {
      const typeBgColor = computed(() => props.typeColor)
      const firstAttribute = computed(
        () => props.ticket.attributes?.find(Boolean) || null
      )

      const bgColorFromAttribute = (attr: string): BgColor => {
        const normalized = attr.toLowerCase()
        if (normalized.includes("vip")) return BgColor.Purple
        if (normalized.includes("regular")) return BgColor.Green
        if (normalized.includes("premium")) return BgColor.Blue
        if (normalized.includes("gold")) return BgColor.Orange
        if (normalized.includes("online")) return BgColor.BlueGreen
        if (normalized.includes("in-person")) return BgColor.DarkGreen
        return BgColor.Gray
      }

      const attributeBgColor = computed(() =>
        props.ticket.ticketType
          ? bgColorFromAttribute(props.ticket.ticketType)
          : BgColor.Gray
      )

      return {
        typeBgColor,
        attributeBgColor,
      }
    },
  })
</script>
