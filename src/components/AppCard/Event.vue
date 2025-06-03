<template>
  <div class="bg-white flex flex-col items-center min-w-[80vw]">
    <app-image-loader
      class="w-full justify-between relative bg-white top-0 z-10 h-[420px] rounded-2xl"
      :photo-url="event.image"
    >
      <div class="relative w-full h-full rounded-2xl bg-[#0a141e50]">
        <div
          class="absolute px-4 top-4 flex items-center w-full space-x-2"
          :class="showFeaturedText ? 'justify-between' : 'justify-end'"
        >
          <app-normal-text
            v-if="showFeaturedText"
            customClass="!text-xxs !font-semibold !text-white !bg-orange rounded-full px-4 py-1.5"
          >
            Featured
          </app-normal-text>

          <app-icon
            :name="event.isFeatured ? 'favourite-red' : 'favourite-inactive'"
          />
        </div>

        <div
          class="bottom-2 left-2 absolute py-1 px-2 flex items-center justify-center"
        >
          <div class="ml-3 gap-4 truncate">
            <app-header-text
              customClass="leading-6 !text-sm !text-white truncate"
            >
              {{ event.title }}
            </app-header-text>

            <div class="flex items-center truncate">
              <app-normal-text customClass="leading-6 !text-xxs !text-white">
                From {{ event.price1 }}
              </app-normal-text>
              <span class="!text-white px-2">●</span>
              <app-normal-text customClass="leading-6 !text-xxs !text-white">
                From {{ event.price2 }}
              </app-normal-text>
              <span class="!text-white px-2">●</span>
              <app-normal-text customClass="leading-6 !text-xxs !text-white">
                From {{ event.price3 }}
              </app-normal-text>
            </div>

            <app-normal-text customClass="leading-6 !text-xxs !text-white">
              {{ event.location }}
            </app-normal-text>
          </div>
        </div>
      </div>
    </app-image-loader>
  </div>
</template>

<script lang="ts">
  /**
   * AppProductCard
   *
   * Reusable event showcase card.
   * Displays background image, prices, title, location, and featured status.
   */

  import { defineComponent } from "vue"
  import AppImageLoader from "../AppImageLoader"
  import AppIcon from "../AppIcon"
  import { AppHeaderText, AppNormalText } from "../AppTypography"

  export default defineComponent({
    name: "AppProductCard",
    components: {
      AppImageLoader,
      AppIcon,
      AppHeaderText,
      AppNormalText,
    },
    props: {
      event: {
        type: Object as () => {
          title: string
          price1: string
          price2: string
          price3: string
          location: string
          image: string
          isFeatured: boolean
        },
        required: true,
      },
      showFeaturedText: {
        type: Boolean,
        default: false,
      },
    },
  })
</script>
