<template>
  <div
    class="bg-white flex items-center rounded-xl border-b w-full py-4"
    @click="handleClick"
  >
    <app-icon :name="order.icon_name" custom-class="!h-12" />

    <div class="ml-3 gap-4 bg-white">
      <app-header-text customClass="leading-6 !text-sm !text-black">
        {{ order.title }}
      </app-header-text>

      <div class="bg-white flex items-center">
        <app-normal-text customClass="leading-6 !text-xxs !text-gray-two">
          {{ order.type }}
        </app-normal-text>

        <span :class="`${getOrderColor(order.icon_name)}  px-2`">●</span>

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
import { defineComponent, PropType } from "vue";
import AppIcon from "../AppIcon";
import { AppHeaderText, AppNormalText } from "../AppTypography";
import { Logic } from "../../composable";

interface Order {
  id: string;
  title: string;
  type: string;
  status: string;
  icon_name: string;
}

export default defineComponent({
  name: "AppOrderDetailsCard",
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
  setup(props, ctx) {
    const getOrderColor = (icon_name: string) => {
      let textColor = "";

      if (icon_name.includes("pending")) {
        textColor = "!text-orange";
      } else if (icon_name.includes("completed")) {
        textColor = "!text-green";
      } else if (icon_name.includes("failed")) {
        textColor = "!text-red";
      } else if (icon_name.includes("success")) {
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

    return {
      getOrderColor,
      handleClick,
    };
  },
});
</script>
