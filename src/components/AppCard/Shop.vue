<template>
  <div class="bg-white flex flex-col items-center min-w-[80vw]">
    <app-image-loader
      class="w-full justify-between relative bg-white top-0 z-10 h-40 rounded-2xl"
      :photo-url="shop.banner || shop.logo || ''"
    >
      <div class="relative w-full h-full rounded-2xl bg-[#0a141e20]">
        <div
          class="absolute px-4 top-4 flex items-center w-full space-x-2"
          :class="showShopStatus ? 'justify-between' : 'justify-end'"
          v-if="false"
        >
          <app-normal-text
            v-if="showShopStatus"
            customClass="!text-xxs !font-semibold !text-white !bg-orange rounded-full px-4 py-1.5"
          >
            Featured
          </app-normal-text>

          <app-icon
            :name="shop.isFavourite ? 'favourite-red' : 'favourite-inactive'"
          />
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
      <div
        class="!size-10 rounded-full bg-white flex items-center justify-center"
      >
        <app-avatar :src="shop.logo" class="!size-10" />
      </div>

      <div class="ml-3 bg-white truncate flex flex-col w-full">
        <app-header-text customClass="leading-6 !text-sm !text-black truncate">
          {{ shop.name }}
        </app-header-text>
        <app-normal-text customClass="leading-6 !text-xxs !text-gray-two">
          {{ Logic.Common.TruncateText(shop.description, false, 50).truncated }}
        </app-normal-text>
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

  import { Logic } from "../../composable"

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

    setup() {
      return {
        Logic,
      }
    },
  })
</script>
