<template>
  <div class="bg-white flex flex-col items-center min-w-[80vw] truncate">
    <app-image-loader
      class="w-full justify-between relative bg-white top-0 z-10 h-[420px] rounded-2xl truncate"
      :photo-url="event.image_url"
    >
      <div
        class="relative w-full h-full rounded-2xl text-white bg-[#0a141e70] truncate"
      >
        <!-- <div
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
        </div> -->

        <div
          class="bottom-2 left-2 absolute py-1 flex items-center justify-center truncate"
        >
          <div class="ml-3 gap-4 truncate">
            <app-header-text
              customClass="leading-6 !text-sm !text-white truncate"
            >
              {{ event.name }}
            </app-header-text>

            <div class="flex items-center truncate">
              <app-normal-text
                v-for="(text, index) in event.sub_titles"
                :key="index"
                customClass="leading-6 !text-xxs !text-white"
              >
                {{ text }}
                <span
                  v-if="index < event.sub_titles.length - 1"
                  class="!text-white px-2"
                >
                  ●
                </span>
              </app-normal-text>
            </div>

            <app-normal-text
              customClass="leading-6 !text-xxs !text-white truncate pr-4"
            >
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
 * AppEventCard
 *
 * Reusable event showcase card.
 * Displays background image, prices, name, location, and featured status.
 */

import { defineComponent } from "vue";
import AppImageLoader from "../AppImageLoader";
import AppIcon from "../AppIcon";
import { AppHeaderText, AppNormalText } from "../AppTypography";

export default defineComponent({
  name: "AppEventCard",
  components: {
    AppImageLoader,
    AppIcon,
    AppHeaderText,
    AppNormalText,
  },
  props: {
    event: {
      type: Object as () => any,
      required: true,
    },
    showFeaturedText: {
      type: Boolean,
      default: false,
    },
  },
  setup() {
    return {};
  },
});
</script>
