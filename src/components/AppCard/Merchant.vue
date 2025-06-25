<template>
  <div class="bg-white flex flex-col items-center min-w-[80vw]">
    <app-image-loader
      class="w-full justify-between relative bg-white top-0   h-40 rounded-2xl"
      :photo-url="merchant.imageUrl"
    >
      <div class="relative w-full h-full rounded-2xl bg-[#0a141e20]">
        <div
          class="absolute px-4 top-4 flex items-center w-full space-x-2"
          :class="merchant.showShopStatus ? 'justify-between' : 'justify-end'"
        >
          <app-normal-text
            v-if="merchant.showShopStatus"
            customClass="!text-xxs !font-semibold !text-white !bg-orange rounded-full px-4 py-1.5"
          >
            {{ merchant.badgeText }}
          </app-normal-text>

          <app-icon
            :name="merchant.showShopStatus ? 'favourite-red' : 'favourite-inactive'"
          />
        </div>

        <div
          class="bottom-2 left-2 absolute py-1 px-2 rounded-2xl bg-white flex items-center justify-center"
        >
          <app-icon name="star-orange" class="!text-white" />
          <app-normal-text
            customClass="leading-6 !text-xxs !font-semibold !text-black pl-1"
          >
            {{ merchant.rating }}
          </app-normal-text>
        </div>
      </div>
    </app-image-loader>

    <div class="bg-white flex items-center w-full py-3">
      <app-avatar :src="merchant.avatar" custom-class="!h-12" />

      <div class="ml-3 gap-4 bg-white truncate">
        <app-header-text
          customClass="leading-6 !text-sm !text-black truncate"
        >
          {{ merchant.title }}
        </app-header-text>

        <div class="bg-white flex items-center truncate">
          <app-normal-text customClass="leading-6 !text-xxs !text-gray-two">
            {{ merchant.category }}
          </app-normal-text>
          <span class="!text-gray-two px-2">●</span>
          <app-normal-text customClass="leading-6 !text-xxs !text-gray-two">
            From {{ merchant.price }}
          </app-normal-text>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
/**
 * AppMerchantCard
 */
import { defineComponent, PropType } from "vue"
import AppImageLoader from "../AppImageLoader"
import AppIcon from "../AppIcon"
import AppAvatar from "../AppAvatar"
import { AppHeaderText, AppNormalText } from "../AppTypography"

interface MerchantCard {
  imageUrl: string
  avatar: string
  title: string
  category: string
  price: string
  rating: string | number
  badgeText?: string
  showShopStatus?: boolean
}

export default defineComponent({
  name: "AppMerchantCard",
  components: {
    AppImageLoader,
    AppIcon,
    AppAvatar,
    AppHeaderText,
    AppNormalText,
  },
  props: {
    merchant: {
      type: Object as PropType<MerchantCard>,
      required: true,
    },
  },
})
</script>
