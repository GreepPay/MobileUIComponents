<template>
  <div class="px-4 py-4 mb-4 border-[1.5px] rounded-[12px] border-[#E0E2E4] flex flex-col">
    <div class="flex flex-row items-center pb-3 mb-3 border-b-[1px] border-[#F0F3F6]">
      <div class="w-[32px] mr-2">
        <app-icon name="arrow-swap" custom-class="!h-[32px]" />
      </div>

      <app-normal-text class="!font-[500]" >
        {{ item.currency.name }}
      </app-normal-text>
      <!-- <app-normal-text class="!font-[500]" v-else>
        {{ item.currency.name }} to USDC
      </app-normal-text> -->
    </div>

    <div class="flex flex-col pb-3 border-b-[1px] border-[#F0F3F6]">
      <app-header-text>
        {{ item.currency.symbol
        }}{{ Logic.Common.convertToMoney(item.rate_per_usd, true, "") }}
      </app-header-text>
      <app-normal-text class="!text-gray-500"> For 1 USDC </app-normal-text>
    </div>

    <!-- Limit -->
    <div :class="`flex flex-col  ${item.trader ? 'py-3 border-b-[1px] border-[#F0F3F6]' : 'pt-3'
      }`">
      <div class="flex flex-col pb-3">
        <app-normal-text class="!text-gray-500 pb-1">
          Cash Limit
        </app-normal-text>
        <app-normal-text class="!text-sm font-[500]">
          {{ item.currency.symbol
          }}{{ Logic.Common.convertToMoney(item.limit.min, true, "") }} -
          {{ item.currency.symbol
          }}{{ Logic.Common.convertToMoney(item.limit.max, true, "") }}
        </app-normal-text>
      </div>

      <div class="flex flex-col pt-3 !border-t-[1px] border-[#F0F3F6]">
        <app-normal-text class="!text-gray-500 pb-1">
          Payout Options
        </app-normal-text>
        <app-normal-text class="!text-sm font-[500]">
          {{ item.payout_options.join(", ") }}
        </app-normal-text>
      </div>
    </div>

    <!-- Trader -->
    <div class="flex flex-col pt-3" v-if="item.trader">
      <div class="w-full flex flex-row items-center">
        <div class="w-[43px]">
          <app-avatar :src="item.trader.photo_url" :name="item.trader.name" :size="40" />
        </div>
        <div class="flex flex-col space-y-[1px] pl-1">
          <app-normal-text class="!font-semibold !line-clamp-1">
            {{ item.trader.name }}
          </app-normal-text>
          <div class="flex flex-row items-center !pt-[2px]">
            <app-normal-text class="!text-gray-500 !line-clamp-1">
              {{ item.trader.no_of_trades }} trade{{
                parseFloat(item.trader.no_of_trades) > 1 ? "s" : ""
              }}
            </app-normal-text>
            <span class="h-[4px] w-[4px] rounded-full !bg-gray-500 mx-2">
            </span>
            <app-normal-text class="!text-gray-500 !line-clamp-1">
              {{ item.trader.success_rate }} success
            </app-normal-text>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import { Logic } from "../../composable";
import { defineComponent } from "vue";
import { AppNormalText, AppHeaderText } from "../AppTypography";
import AppIcon from "../AppIcon";
import AppAvatar from "../AppAvatar";

interface Item {
  currency: {
    code: string;
    symbol: string;
    name: string;
  };
  rate_per_usd: number;
  limit: {
    min: number;
    max: number;
  };
  payout_options: string[];
  trader?: {
    photo_url: string;
    name: string;
    no_of_trades: string;
    success_rate: string;
  };
  ad_type?: string;
}

/**
 * Component that displays an exchange advertisement.
 */
export default defineComponent({
  name: "AppExchangeAd",
  components: {
    AppNormalText,
    AppIcon,
    AppAvatar,
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
<!-- <style scoped>
.blend-in {
  animation: fadein 0.15s;
  -moz-animation: fadein 0.15s; /* Firefox */
  -webkit-animation: fadein 0.15s; /* Safari and Chrome */
  -o-animation: fadein 0.15s; /* Opera */
}
</style> -->
