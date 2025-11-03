<template>
  <div class="w-full h-full flex flex-col">
    <div class="h-fit min-w-[140px] w-full">
      <div
        class="w-[140px] h-32 relative animate-pulse rounded-XL border-[1px] !border-gray-100 from-gray-200 to-gray-100 bg-gradient-to-r bg-size-200 bg-pos-0"
      ></div>

      <div class="flex flex-col pt-2">
        <p class="!truncate w-full h-5 animate-pulse"></p>
        <p class="!truncate w-3/4 h-5 animate-pulse"></p>
      </div>
    </div>
  </div>
</template>
<script lang="ts">
  import { defineComponent } from "vue"

  export default defineComponent({
    name: "AppSkeletonLoaderProductCard",

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
