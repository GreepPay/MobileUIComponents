<template>
  <div class="bg-white flex items-center rounded-xl border min-w-[80vw] p-3">
    <app-icon :name="order.icon || 'icon-circle'" custom-class="!h-12" />

    <div class="ml-3 gap-4 bg-white flex-1">
      <app-header-text
        customClass="leading-6 !text-[13px] !text-black !font-semibold !line-clamp-1"
      >
        {{ order.title }}
      </app-header-text>

      <div class="bg-white flex items-center">
        <app-normal-text customClass="leading-6 !text-xxs !text-gray-two">
          {{ order.label }}
        </app-normal-text>

        <span class="!text-orange px-2">●</span>

        <app-normal-text
          customClass="leading-6 !text-xxs"
          :style="`color: ${order.statusColor || '#FF9500'}`"
        >
          {{ order.status }}
        </app-normal-text>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from "vue";
import AppIcon from "../AppIcon";
import { AppHeaderText, AppNormalText } from "../AppTypography";

interface Order {
  title: string;
  label: string;
  status: string;
  icon?: string;
  statusColor?: string;
}

export default defineComponent({
  name: "AppOrderCard",
  components: {
    AppIcon,
    AppHeaderText,
    AppNormalText,
  },
  props: {
    order: {
      type: Object as PropType<Order>,
      required: true,
    },
  },
});
</script>
