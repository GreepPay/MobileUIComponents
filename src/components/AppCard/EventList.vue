<template>
  <div class="w-full flex justify-between items-center py-2 px-4">
    <app-image-loader
      class="size-[72px] rounded-2xl relative bg-black"
      :photo-url="event.image_url"
    >
      <!-- <div class="relative bg-black-overlay w-full h-full rounded-2xl">
        <app-icon name="favourite-red" class="absolute top-2 left-2 h-5" />
      </div> -->
    </app-image-loader>

    <div class="flex-1 ml-3 flex flex-col space-y-[1px] truncate">
      <app-normal-text
        class="!text-left !line-clamp-1 block !text-black !font-semibold !text-base"
      >
        {{ event.name }}
      </app-normal-text>

      <div class="flex items-center truncate">
        <app-normal-text
          v-for="(text, index) in event.sub_titles"
          :key="index"
          customClass="leading-6 !text-xxs !text-black"
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
        customClass="leading-6 !text-xxs !text-black truncate pr-4"
      >
        <span v-html="event.location || event.description"> </span>
      </app-normal-text>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed } from "vue";
import AppImageLoader from "../AppImageLoader";
import AppIcon from "../AppIcon";
import { AppNormalText } from "../AppTypography";

export default defineComponent({
  name: "AppEventListItem",
  components: {
    AppImageLoader,
    AppIcon,
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
