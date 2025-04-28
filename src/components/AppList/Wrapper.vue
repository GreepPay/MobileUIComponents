<template>
  <div
    class="w-full flex flex-col px-4 py-3 mb-2 bg-white"
    :class="customClass"
  >
    <div class="w-full flex justify-between items-center">
      <app-normal-text class="font-semibold !text-black !text-sm">
        {{ title }}
      </app-normal-text>
      <app-normal-text class="text-primary" @click="emit('view-more')">
        {{ actionText }}
      </app-normal-text>
    </div>

    <div class="py-2">
      <template v-if="hasItems">
        <div
          class="flex items-center gap-4 overflow-x-auto h-fit scrollbar-hide"
        >
          <slot />
        </div>
      </template>
      <div v-else class="py-4 !pt-2">
        <app-empty-state :title="emptyTitle" :description="emptyDescription" />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
  import { defineComponent, computed } from "vue"
  import { AppNormalText } from "../AppTypography"
  import AppEmptyState from "../AppEmptyState"

  export default defineComponent({
    name: "AppListWrapper",
    components: {
      AppNormalText,
      AppEmptyState,
    },
    props: {
      title: {
        type: String,
        default: "Title",
      },
      actionText: {
        type: String,
        default: "See all",
      },
      items: {
        type: Array as () => any[],
        default: () => [],
      },
      emptyTitle: {
        type: String,
        default: "No Similar products available",
      },
      emptyDescription: {
        type: String,
        default: "See all Similar products",
      },
      customClass: {
        type: String,
        default: "",
      },
    },
    emits: ["view-more"],
    setup(props, { emit }) {
      const hasItems = computed(() => props.items.length > 0)

      return { hasItems, emit }
    },
  })
</script>

<style scoped>
  .scrollbar-hide::-webkit-scrollbar {
    display: none;
  }
  .scrollbar-hide {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
</style>
