<template>
  <div
    class="bg-white flex items-center rounded-xl border-b w-full py-4 overflow-x-hidden"
    @click="handleClick"
  >
    <app-icon v-if="!iconIsUrl" :name="order.icon_name" custom-class="!h-12" />
    <template v-else>
      <div class="w-[42px]">
        <app-image-loader
          :photo-url="order.icon_name"
          class="h-[42px] w-[42px] rounded-full border-[1px] border-veryLightGray"
        />
      </div>
    </template>

    <div class="ml-3 gap-4 bg-white w-full">
      <div class="w-full flex flex-row items-center justify-between space-x-2">
        <app-header-text
          customClass="leading-6 !text-[12.5px] !text-black !line-clamp-1 !text-left"
        >
          {{ order.title }}
        </app-header-text>
        <template v-if="!isMini">
          <app-normal-text
            class="!text-gray-400 !text-right !whitespace-nowrap"
          >
            {{ Logic.Common.fomartDate(order.date_updated, "MMM DD, h:mmA") }}
          </app-normal-text>
        </template>
      </div>

      <div class="bg-white flex items-center">
        <app-normal-text customClass="leading-6 !text-xxs !text-gray-400">
          {{ order.type }}
        </app-normal-text>

        <span :class="`${getOrderColor(order.icon_name, order.status)}  px-2`"
          >●</span
        >

        <app-normal-text
          :customClass="`leading-6 !text-xxs ${getOrderColor(
            order.status
          )} capitalize`"
        >
          {{ order.status }}
        </app-normal-text>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, PropType } from "vue";
import AppIcon from "../AppIcon";
import { AppHeaderText, AppNormalText } from "../AppTypography";
import { Logic } from "../../composable";
import AppImageLoader from "../AppImageLoader";

interface Order {
  id: string;
  title: string;
  type: string;
  status: string;
  icon_name: string;
  date_updated: string;
}

export default defineComponent({
  name: "AppOrderDetailsCard",
  components: {
    AppIcon,
    AppHeaderText,
    AppNormalText,
    AppImageLoader,
  },
  props: {
    order: {
      type: Object as PropType<Order>,
      required: true,
    },
    isMini: {
      type: Boolean,
      default: false,
    },
  },
  setup(props, ctx) {
    const getOrderColor = (icon_name: string, status = "") => {
      let textColor = "";

      if (icon_name.includes("pending")) {
        textColor = "!text-orange";
      } else if (icon_name.includes("completed")) {
        textColor = "!text-green";
      } else if (icon_name.includes("failed")) {
        textColor = "!text-red";
      } else if (icon_name.includes("success")) {
        textColor = "!text-green";
      } else if (
        icon_name.includes("purchased") ||
        status.toLowerCase() === "purchased"
      ) {
        textColor = "!text-green";
      } else {
        textColor = "!text-blue";
      }
      return textColor;
    };

    const handleClick = () => {
      ctx.emit("click");
      const type = props.order.type.toLowerCase();

      if (type.includes("p2p")) {
        Logic.Common.GoToRoute(`/chat/${props.order.id}?p2p=true`);
      }
    };

    const iconIsUrl = computed((): boolean => {
      const val = props.order.icon_name;
      if (typeof val !== "string" || !val.trim()) return false;

      // Prefer URL constructor for accuracy, fall back to regex for protocol-relative URLs
      try {
        new URL(val);
        return true;
      } catch {
        return /^\/\/|^https?:\/\//i.test(val);
      }
    });

    return {
      iconIsUrl,
      Logic,
      getOrderColor,
      handleClick,
    };
  },
});
</script>
