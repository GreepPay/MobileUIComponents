<template>
  <div
    class="w-full flex flex-row items-center py-4 border-b-[1.5px] border-[#F0F3F6]"
  >
    <div class="w-[72px] mr-4">
      <app-image-loader
        :photo-url="event.image_url"
        class="w-[76px] h-[76px] rounded-[12px]"
      />
    </div>

    <div class="w-full flex flex-col">
      <app-normal-text class="!text-sm !font-semibold !text-left mb-1">
        {{ event.title }}
      </app-normal-text>
      <div class="w-full flex flex-row mb-1 items-center">
        <template v-for="(item, index) in event.sub_titles" :key="index">
          <app-normal-text class="!text-left">
            {{ item }}
          </app-normal-text>

          <span
            v-if="index != event.sub_titles.length - 1"
            class="h-[4px] w-[4px] rounded-full bg-black !mx-[6px]"
          ></span>
        </template>
      </div>
      <app-normal-text class="!text-[#616161] !text-left !line-clamp-1">
        {{ event.location }}
      </app-normal-text>
    </div>
  </div>
</template>

<script lang="ts">
/**
 * AppEvent
 *
 * Reusable event showcase card.
 * Displays background image, prices, title, location, and featured status.
 */

import { defineComponent } from "vue";
import AppImageLoader from "../AppImageLoader";
import AppIcon from "../AppIcon";
import { AppHeaderText, AppNormalText } from "../AppTypography";

export default defineComponent({
  name: "AppEvent",
  components: {
    AppImageLoader,
    AppIcon,
    AppHeaderText,
    AppNormalText,
  },
  props: {
    event: {
      type: Object as () => {
        image_url: string;
        title: string;
        sub_titles: string[];
        location: string;
      },
      required: true,
    },
  },
});
</script>
