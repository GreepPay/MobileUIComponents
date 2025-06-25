<template>
  <app-image-loader
    :class="[
      'w-36 rounded-2xl col-span-2',
      bgColorFromIndex(index),
      customClass,
    ]"
    :photo-url="photoUrl"
  >
    <div class="relative flex flex-col w-full h-full rounded-2xl p-4">
      <div v-if="showType" class="flex justify-between items-center mb-5">
        <app-normal-text class="!text-white !text-base">
          {{ coupon.type }}
        </app-normal-text>

        <app-normal-text v-if="isUsed" class="!text-white !text-base">
          {{ coupon.statusText }}
        </app-normal-text>
      </div>

      <div class="flex flex-col">
        <!-- Discount Text -->
        <app-header-text class="!text-white !font-medium">
          {{ coupon.discountText }}
        </app-header-text>

        <app-normal-text class="!text-white !text-base">
          {{ coupon.description }}
        </app-normal-text>
      </div>

      <!-- White dot (icon or badge indicator) -->
      <div
        class="absolute top-0 right-0 flex flex-col justify-center items-center w-6 -mr-3 h-full"
      >
        <span class="block bg-white rounded-full size-6"></span>
      </div>
    </div>
  </app-image-loader>
</template>

<script lang="ts">
  /**
   * AppCouponCard
   *
   * A reusable promotional/discount card component.
   * Shows discount text and points required, with customizable background.
   */
  import { defineComponent } from "vue"
  import AppImageLoader from "../AppImageLoader"
  import { AppHeaderText, AppNormalText } from "../AppTypography"
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
    name: "AppCouponCard",
    components: { AppImageLoader, AppHeaderText, AppNormalText },
    props: {
      coupon: {
        type: Object as () => {
          discountText: String
          description: String
          type: String
          statusText: String
        },
        required: true,
      },
      index: {
        type: Number,
        default: 1,
      },
      showType: {
        type: Boolean,
        default: false,
      },
      isUsed: {
        type: Boolean,
        default: false,
      },
      /**
       * Optional custom Tailwind classes (e.g. !bg-green)
       */
      customClass: {
        type: String,
        default: "",
      },
      /**
       * Image URL to show behind the card
       */
      photoUrl: {
        type: String,
        default: "/images/greep-transparent-logo.svg",
      },
    },

    setup(props) {
      const bgColorFromIndex = (index: number): BgColor => {
        const colors = [
          BgColor.Green,
          BgColor.Purple,
          BgColor.Orange,
          BgColor.Blue,
          BgColor.DarkGreen,
          BgColor.BlueGreen,
        ]

        const bgColor = props.isUsed
          ? BgColor.Gray
          : colors[index % colors.length]

        return bgColor
      }

      return { bgColorFromIndex }
    },
  })
</script>
