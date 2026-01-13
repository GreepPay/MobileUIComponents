<template>
  <div class="w-full flex flex-row h-[130px]">
    <div class="w-[20%] flex flex-col h-full relative">
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 34 86"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M34 85.5H10C4.47715 85.5 4.02687e-08 81.0229 0 75.5V74C3.31371 74 6 71.3137 6 68C6 64.6863 3.31371 62 0 62V57C3.31371 57 6 54.3137 6 51C6 47.6863 3.31371 45 0 45V40C3.31371 40 6 37.3137 6 34C6 30.6863 3.31371 28 0 28V23C3.31371 23 6 20.3137 6 17C6 13.6863 3.31371 11 0 11V10C0 4.47715 4.47715 0 10 0H34V85.5Z"
          :fill="`url(#paint0_linear_41969_26765_${randomId})`"
        />
        <defs>
          <linearGradient
            :id="`paint0_linear_41969_26765_${randomId}`"
            x1="26.5"
            y1="-38.5"
            x2="22.1402"
            y2="92.5546"
            gradientUnits="userSpaceOnUse"
          >
            <stop :stop-color="coupon.colors.split('-')[0]" />
            <stop offset="0.9" :stop-color="coupon.colors.split('-')[1]" />
          </linearGradient>
        </defs>
      </svg>

      <div
        class="absolute w-full h-full top-0 left-0 pl-1 items-center justify-center flex"
      >
        <app-normal-text
          class="!text-white !font-semibold !text-base"
          style="
            display: inline-block;
            transform: rotate(-90deg);
            transform-origin: center;
          "
        >
          DISCOUNT
        </app-normal-text>
      </div>
    </div>
    <div
      class="w-[80%] flex flex-col justify-between rounded-r-[12px] px-3 py-2"
      :style="`background-color: ${coupon.colors.split('-')[0]}1A; `"
    >
      <div class="w-full flex flex-col">
        <app-normal-text
          class="!w-full !line-clamp-1 !text-[#5B5760] !font-semibold !text-left !text-[11px]"
        >
          {{ coupon.tagline }}
        </app-normal-text>

        <app-header-text class="!text-base py-1 !line-clamp-1">
          {{ coupon.title }}
        </app-header-text>

        <app-normal-text class="!text-[9px] !text-[#393540] !text-left"
          >{{
            coupon.currentAmount
              ? " Auto-applied on your next order"
              : "Will be auto-applied on the order"
          }}
        </app-normal-text>

        <app-normal-text
          class="!text-[9px] !text-[#009DE3] !text-left pt-[2px]"
        >
          Valid for {{ coupon.validityInDays }} day{{
            coupon.validityInDays > 1 ? "s" : ""
          }}
        </app-normal-text>
      </div>

      <div class="w-full flex flex-col">
        <template v-if="coupon.currentAmount == undefined">
          <app-normal-text class="!text-[10px] !text-left">
            Target Amount: {{ coupon.currencySymbol
            }}{{ Logic.Common.convertToMoney(coupon.targetAmount, false, "") }}
          </app-normal-text>
        </template>
        <template v-else>
          <div class="w-full relative h-[7px] bg-[#ffffff] rounded-[8px]">
            <div
              class="absolute top-0 left-0 h-full rounded-[8px]"
              :style="`background: linear-gradient(90deg, ${
                coupon.colors.split('-')[0]
              }, ${coupon.colors.split('-')[1]}); width: ${
                (coupon.currentAmount / coupon.targetAmount) * 100
              }%;`"
            ></div>
          </div>
          <div class="w-full flex flex-row justify-end pt-[2px]">
            <app-normal-text class="!text-[10px] !text-right">
              {{
                Logic.Common.convertToMoney(coupon.currentAmount, false, "")
              }}/{{
                Logic.Common.convertToMoney(coupon.targetAmount, false, "")
              }}
              {{ coupon.currencySymbol }}
            </app-normal-text>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
/**
 * AppDiscountCouponCard
 *
 * A reusable promotional/discount card component.
 * Shows discount text and points required, with customizable background.
 */
import { defineComponent } from "vue";
import AppImageLoader from "../AppImageLoader";
import { AppHeaderText, AppNormalText } from "../AppTypography";
import { Logic } from "../../composable";

export default defineComponent({
  name: "AppDiscountCouponCard",
  components: { AppImageLoader, AppHeaderText, AppNormalText },
  props: {
    coupon: {
      type: Object as () => {
        title: string;
        tagline: string;
        validityInDays: number;
        colors: string;
        targetAmount: number;
        currencySymbol: string;
        currentAmount?: number;
      },
      required: false,
      default: () => ({
        title: "₺125 OFF",
        tagline: "Spend at least ₺1,000 this week",
        validityInDays: 7,
        colors: "#0D965E-#00683F",
        targetAmount: 1000,
        currencySymbol: "₺",
      }),
    },
  },

  setup(props) {
    const randomId = Math.random().toString(36).substring(2, 15);
    return {
      Logic,
      randomId,
    };
  },
});
</script>
