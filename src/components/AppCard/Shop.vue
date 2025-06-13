<template>
  <div class="bg-white flex flex-col items-center min-w-[80vw]">
    <app-image-loader
      class="w-full justify-between relative bg-white top-0 z-10 h-40 rounded-2xl"
      :photo-url="shop.image"
    >
      <div class="relative w-full h-full rounded-2xl bg-[#0a141e20]">
        <div
          class="absolute px-4 top-4 flex items-center w-full space-x-2"
          :class="showShopStatus ? 'justify-between' : 'justify-end'"
        >
          <app-normal-text
            v-if="showShopStatus"
            customClass="!text-xxs !font-semibold !text-white !bg-orange rounded-full px-4 py-1.5"
          >
            Featured
          </app-normal-text>

          <app-icon :name="shop.isFavourite ? 'favourite-red' : 'favourite-inactive'" />
        </div>

        <div
          class="bottom-2 left-2 absolute py-1 px-2 rounded-2xl bg-white flex items-center justify-center"
        >
          <app-icon name="star-orange" class="!text-white" />
          <app-normal-text
            customClass="leading-6 !text-xxs !font-semibold !text-black pl-1"
          >
            {{ shop.rating }}
          </app-normal-text>
        </div>
      </div>
    </app-image-loader>

    <div class="bg-white flex items-center w-full py-3">
      <app-avatar :src="shop.logo" custom-class="!h-12" />

      <div class="ml-3 gap-4 bg-white truncate">
        <app-header-text customClass="leading-6 !text-sm !text-black truncate">
          {{ shop.name }}
        </app-header-text>

        <div class="bg-white flex items-center truncate">
          <app-normal-text customClass="leading-6 !text-xxs !text-gray-two">
            {{ shop.category }}
          </app-normal-text>
          <span class="!text-gray-two px-2">●</span>
          <app-normal-text customClass="leading-6 !text-xxs !text-gray-two">
            From {{ shop.price }}
          </app-normal-text>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
  /**
   * AppShopCard
   *
   * Reusable shop showcase card.
   * Displays image, rating, name, category, and price with favorite and featured indicators.
   */

  import { defineComponent } from "vue"
  import AppImageLoader from "../AppImageLoader"
  import AppIcon from "../AppIcon"
  import { AppHeaderText, AppNormalText } from "../AppTypography"
  import AppAvatar from "../AppAvatar"

  export default defineComponent({
    name: "AppShopCard",
    components: {
      AppImageLoader,
      AppIcon,
      AppHeaderText,
      AppNormalText,
      AppAvatar,
    },
    props: {
      shop: {
        type: Object as () => {
          name: string
          category: string
          price: string
          rating: string
          image: string
          logo: string
          isFavourite: boolean
        },
        required: true,
      },
      showShopStatus: {
        type: Boolean,
        default: false,
      },
    },
  })
</script>
