<template>
  <div class="w-full flex justify-between items-center py-2 px-4">
    <app-image-loader
      class="size-[72px] rounded-2xl relative"
      :photo-url="event.image"
    >
      <div class="relative bg-black-overlay w-full h-full rounded-2xl">
        <app-icon name="favourite-red" class="absolute top-2 left-2 h-5" />
      </div>
    </app-image-loader>

    <div class="flex-1 ml-3 flex flex-col space-y-[2px]">
      <app-normal-text
        class="!text-left !line-clamp-1 block !text-black !font-semibold !text-base"
      >
        {{ event.title }}
      </app-normal-text>

      <div class="flex items-center truncate">
        <app-normal-text customClass="!text-black !text-xxs">
          From {{ event.price }}
        </app-normal-text>
        <span class="px-2">●</span>
        <app-normal-text customClass="!text-black !text-xxs">
          {{ event.date }}
        </app-normal-text>
        <span class="px-2">●</span>
        <app-normal-text customClass="!text-black !text-xxs">
          {{ event.time }}
        </app-normal-text>
      </div>

      <app-normal-text class="!text-sm font-medium !text-gray-two">
        {{ event.tag }}
      </app-normal-text>
    </div>
  </div>
</template>

<script lang="ts">
  import { defineComponent, PropType } from "vue"
  import AppImageLoader from "../AppImageLoader"
  import AppIcon from "../AppIcon"
  import { AppNormalText } from "../AppTypography"

  export default defineComponent({
    name: "AppEventListItem",
    components: {
      AppImageLoader,
      AppIcon,
      AppNormalText,
    },
    props: {
      event: {
        type: Object as PropType<{
          title: string
          price: string
          date: string
          time: string
          tag: string
          image: string
        }>,
        required: true,
      },
    },
  })
</script>
