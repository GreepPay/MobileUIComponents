<template>
  <div class="w-full flex justify-between items-center py-2 px-4">
    <app-image-loader
      class="size-[72px] rounded-2xl relative"
      :photo-url="event.images.find((img) => img.isPrimary)?.url"
    >
      <!-- <div class="relative bg-black-overlay w-full h-full rounded-2xl">
        <app-icon name="favourite-red" class="absolute top-2 left-2 h-5" />
      </div> -->
    </app-image-loader>

    <div class="flex-1 ml-3 flex flex-col space-y-[2px] truncate">
      <app-normal-text
        class="!text-left !line-clamp-1 block !text-black !font-semibold !text-base"
      >
        {{ event.name }}
      </app-normal-text>

      <div class="flex items-center truncate">
        <app-normal-text customClass="!text-black !text-xxs">
          {{ event.type }}
        </app-normal-text>
        <span class="px-2">●</span>
        <app-normal-text customClass="!text-black !text-xxs">
          {{ event.currency }} {{ event.price }}
        </app-normal-text>
        <span class="px-2">●</span>
        <app-normal-text customClass="!text-black !text-xxs">
          Tax: {{ event.taxCode }}
        </app-normal-text>
      </div>

      <app-normal-text class="!text-sm font-medium !text-gray-two truncate">
        {{ event.description }}
      </app-normal-text>
    </div>
  </div>
</template>

<script lang="ts">
  import { defineComponent } from "vue"
  import AppImageLoader from "../AppImageLoader"
  import AppIcon from "../AppIcon"
  import { AppNormalText } from "../AppTypography"
  import { Product } from "@greep/logic/src/gql/graphql"

  export default defineComponent({
    name: "AppEventListItem",
    components: {
      AppImageLoader,
      AppIcon,
      AppNormalText,
    },
    props: {
      event: {
        type: Object as () => Product,
        required: true,
      },
    },
  })
</script>
