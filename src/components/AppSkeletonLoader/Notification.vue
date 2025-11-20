<template>
  <div
    class="w-full h-full flex items-center gap-3 border-b mb-3 pb-3 pt-2 rounded-xl"
  >
    <div class="size-8 rounded-full bg-gray-200 animate-pulse"></div>

    <div class="w-full flex-1 flex flex-col space-y-1 justify-start">
      <div class="flex items-center justify-between">
        <div class="h-[10px] w-32 bg-gray-200 animate-pulse rounded-md"></div>
        <div class="h-[10px] w-10 bg-gray-200 animate-pulse rounded-md"></div>
      </div>

      <div class="flex flex-col gap-2 mt-2">
        <div
          v-for="line in descriptionNoOfLines"
          :key="line"
          class="h-[10px] bg-gray-200 animate-pulse rounded-md"
          :class="line === descriptionNoOfLines ? 'w-3/4' : 'w-full'"
        ></div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
  import { defineComponent } from "vue"

  export default defineComponent({
    name: "AppSkeletonLoaderProductCard",
    props: {
      descriptionNoOfLines: {
        type: Number,
        default: 2,
      },
    },

    setup() {
      return {}
    },
  })
</script>

<style scoped>
  .skeleton {
    background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 37%, #f0f0f0 63%);
    background-size: 400% 100%;
    animation: shimmer 1.4s ease infinite;
  }
</style>
