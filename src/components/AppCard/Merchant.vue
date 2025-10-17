<template>
  <div class="bg-white flex flex-col items-center min-w-[80vw]">
    <app-image-loader
      class="w-full justify-between relative bg-[#0a141e20] top-0 h-40 rounded-2xl"
      :photo-url="merchant?.banner || defaultBanner"
    >
      <div
        class="relative w-full h-full rounded-2xl bg-[#0a141e20]"
        v-if="showImageDetails"
      >
        <div
          class="absolute px-4 top-4 flex items-center w-full space-x-2"
          :class="showMerchantStatus ? 'justify-between' : 'justify-end'"
        >
          <app-normal-text
            v-if="showMerchantStatus"
            customClass="!text-xxs !font-semibold !text-white !bg-orange rounded-full px-4 py-1.5"
          >
            {{ merchant.badgeText }}
          </app-normal-text>

          <app-icon
            :name="showMerchantStatus ? 'favourite-red' : 'favourite-inactive'"
          />
        </div>

        <div
          class="bottom-2 left-2 absolute py-1 px-2 rounded-2xl bg-white flex items-center justify-center"
        >
          <app-icon name="star-orange" class="!text-white" />
          <app-normal-text
            customClass="leading-6 !text-xxs !font-semibold !text-black pl-1"
          >
            {{ merchant.rating || "N/A" }}
          </app-normal-text>
        </div>
      </div>
    </app-image-loader>

    <div class="bg-white flex items-center w-full py-3">
      <!--  -->
      <div class="!h-11 !w-11 rounded-full rounded-full">
        <app-avatar
          v-if="merchant.logo"
          :src="merchant.logo"
          custom-class="!h-11 !w-11 rounded-full"
        />
        <app-icon
          v-else
          name="grp-union"
          custom-class="!h-11 !w-11 rounded-full"
        />
      </div>

      <div class="ml-3 gap-4 bg-white truncate">
        <app-header-text customClass="leading-6 !text-sm !text-black truncate">
          {{ merchant?.business_name || "Unknown Merchant" }}
        </app-header-text>

        <div class="bg-white flex items-center truncate">
          <app-normal-text
            customClass="leading-6 !text-xxs capitalize !text-gray-two"
          >
            {{ merchant?.description || "No description available" }}
          </app-normal-text>
          <!-- <span class="!text-gray-two px-2">●</span>
          <app-normal-text customClass="leading-6 !text-xxs !text-gray-two">
            From {{ merchant.price }}
          </app-normal-text> -->
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
        type: Object as PropType<any>,
        required: true,
      },
      showMerchantStatus: {
        type: Boolean,
        default: false,
      },
      showImageDetails: {
        type: Boolean,
        default: false,
      },
    },
    setup() {
      const defaultBanner = "/images/greep-transparent-logo.svg"

      return {
        defaultBanner,
      }
    },
  })
</script>
