<template>
  <div class="bg-white flex items-center rounded-xl border w-full p-3">
    <app-icon name="icon-circle-ticket" custom-class="!h-12" />

    <div class="ml-3 gap-4 bg-white truncate">
      <app-header-text
        customClass="leading-6 !text-sm !text-black truncate"
      >
        {{ ticket.title }}
      </app-header-text>

      <div class="bg-white flex items-center truncate">
        <app-normal-text customClass="leading-6 !text-xxs !text-gray-two">
          {{ ticket.date }}
        </app-normal-text>

        <span class="!text-gray-two px-2">●</span>

        <app-normal-text customClass="leading-6 !text-xxs !text-gray-two">
          {{ ticket.time }}
        </app-normal-text>

        <span class="!text-gray-two px-2">●</span>

        <app-normal-text
          customClass="leading-6 !text-xxs !text-gray-two truncate"
        >
          {{ ticket.location }}
        </app-normal-text>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from "vue"
import AppIcon from "../AppIcon"
import { AppHeaderText, AppNormalText } from "../AppTypography"

interface Ticket {
  title: string
  date: string
  time: string
  location: string
}

export default defineComponent({
  name: "AppTicketCard",
  components: {
    AppIcon,
    AppHeaderText,
    AppNormalText,
  },
  props: {
    ticket: {
      type: Object as PropType<Ticket>,
      required: true,
    },
  },
})
</script>
