<template>
  <div
    :class="`w-full flex flex-col space-y-1 px-4 py-4 !border-[2px] mb-3 border-[#F0F3F6] rounded-[16px] relative ${customClass}`"
    :style="customStyle"
  >
    <div class="w-full flex flex-row items-center">
      <div class="w-[24px]">
        <app-image-loader
          :photo-url="item.user.photo_url"
          class="h-[24px] w-[24px] !rounded-full !border-[1.5px] !border-[#E0E0E0]"
        />
      </div>
      <div class="ml-2 flex flex-row items-center">
        <app-normal-text class="!font-medium !text-[12px]">
          {{ item.user.name }}
        </app-normal-text>
        <app-icon
          v-if="item.user.is_verified"
          name="verified-badge"
          custom-class="h-[16px] ml-1"
        />
      </div>
    </div>

    <div class="w-full flex flex-row pt-[1px]">
      <app-header-text class="!text-semibold">
        {{ item.base_currency }}
        {{ Logic.Common.convertToMoney(item.rate, true, "", false) }}
        <span class="!text-xs">per {{ item.target_currency }}</span>
      </app-header-text>
    </div>

    <div class="w-full flex flex-row items-center">
      <app-normal-text class="!text-[#616161]">
        {{ item.target_currency_symbol
        }}{{ Logic.Common.convertToMoney(item.min_amount, true, "", false) }}
        min
      </app-normal-text>

      <span class="!text-[#616161] !text-xs mx-2">
        <!-- Dot -->
        &bull;
      </span>

      <app-normal-text class="!text-[#616161]">
        {{ item.target_currency_symbol
        }}{{ Logic.Common.convertToMoney(item.max_amount, true, "", false) }}
        max
      </app-normal-text>
    </div>
  </div>
</template>
<script lang="ts">
import { Logic } from "../../composable";
import { defineComponent } from "vue";
import { AppNormalText, AppHeaderText } from "../AppTypography";
import AppIcon from "../AppIcon";
import AppImageLoader from "../AppImageLoader";

interface Item {
  id: string;
  user: {
    name: string;
    photo_url: string;
    is_verified: boolean;
  };
  base_currency: string;
  base_currency_symbol: string;
  target_currency: string;
  target_currency_symbol: string;
  rate: number;
  min_amount: number;
  max_amount: number;
  supported_payment_methods: {
    method: string;
    details: Record<string, any>;
  }[];
}

/**
 * Component that displays an exchange advertisement.
 */
export default defineComponent({
  name: "AppExchangeAd",
  components: {
    AppNormalText,
    AppIcon,
    AppImageLoader,
    AppHeaderText,
  },
  props: {
    /**
     * URL of the image to load.
     * @requires
     */
    item: {
      type: Object as () => Item,
      required: true,
    },
    /**
     * Custom CSS classes to apply to the container `<div>` element.
     */
    customClass: {
      type: String,
      default: "",
    },
    /**
     * Custom inline styles to apply to the container `<div>` element.
     */
    customStyle: {
      type: String,
      default: "",
    },
  },
  setup() {
    return {
      Logic,
    };
  },
});
</script>
