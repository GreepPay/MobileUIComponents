<template>
  <div class="bg-white flex flex-col items-center min-w-[80vw] truncate">
    <app-image-loader
      class="w-full justify-between relative bg-white top-0 z-10 h-[260px] rounded-[12px] truncate"
      :photo-url="event.image_url"
    >
    </app-image-loader>
    <div class="w-full flex flex-col items-start pt-2">
      <app-header-text customClass="  !text-sm !font-semibold truncate">
        {{ event.name }}
      </app-header-text>

      <div class="flex items-center truncate pt-1">
        <app-normal-text
          v-for="(text, index) in event.sub_titles"
          :key="index"
          customClass="!text-xxs !text-black"
        >
          {{ text }}
          <span
            v-if="index < event.sub_titles.length - 1"
            class="!text-black px-2"
          >
            ●
          </span>
        </app-normal-text>
      </div>

      <app-normal-text
        customClass="!text-xxs !text-[#999999] truncate pr-4 pt-[3px]"
      >
        {{ event.location }}
      </app-normal-text>
    </div>
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
