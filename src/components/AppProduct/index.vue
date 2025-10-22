<template>
  <div
    class="w-full flex flex-row items-center py-4 border-b-[1.5px] border-[#F0F3F6]"
  >
    <div class="w-[72px] mr-4">
      <app-image-loader
        :photo-url="product.image_url"
        class="w-[76px] h-[76px] rounded-[12px] !border-[1.5px] !border-gray-100"
      />
    </div>

    <div class="w-full flex flex-col h-full justify-between">
      <app-normal-text
        class="!text-sm !font-semibold !text-left mb-1 !line-clamp-1"
      >
        {{ product.title }}
      </app-normal-text>
      <div class="w-full flex flex-row mb-1 items-center">
        <app-normal-text class="!text-left !text-[#999999]">
          {{ product.category }}
        </app-normal-text>
        <span
          :class="`h-[4px] w-[4px] rounded-full !mx-[6px]`"
          :style="`background-color: ${stockColor(product.stock)};`"
        ></span>

        <app-normal-text
          class="!text-left"
          :style="`color: ${stockColor(product.stock)};`"
        >
          {{ product.stock }} piece{{ product.stock != 1 ? "s" : "" }} left
        </app-normal-text>
      </div>
      <app-normal-text
        class="!text-[#0A141E] !text-left !line-clamp-1 !font-semibold !text-base"
      >
        {{ product.currency_symbol }}
        {{ Logic.Common.convertToMoney(product.price, true, "") }}
      </app-normal-text>
    </div>
  </div>
</template>

<script lang="ts">
/**
 * AppProduct.vue
 *
 * Reusable event showcase card.
 * Displays background image, prices, title, location, and featured status.
 */

import { defineComponent } from "vue";
import AppImageLoader from "../AppImageLoader";
import AppIcon from "../AppIcon";
import { AppHeaderText, AppNormalText } from "../AppTypography";
import { Logic } from "../../composable";

export default defineComponent({
  name: "AppEvent",
  components: {
    AppImageLoader,
    AppIcon,
    AppHeaderText,
    AppNormalText,
  },
  props: {
    product: {
      type: Object as () => {
        image_url: string;
        title: string;
        category: string;
        stock: number;
        currency_symbol: string;
        price: number;
      },
      required: true,
    },
  },
  setup() {
    const stockColor = (stock: number) => {
      if (stock > 10) {
        return "#00683F";
      } else if (stock > 0 && stock <= 10) {
        return "#FF7B3B";
      } else {
        return "#D71E0F";
      }
    };

    return {
      stockColor,
      Logic,
    };
  },
});
</script>
