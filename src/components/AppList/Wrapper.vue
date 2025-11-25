<template>
  <div class="w-full flex flex-col pt-3 mb-2 bg-white" :class="customClass">
    <div
      class="w-full flex justify-between items-center px-4 mb-0.5 pt-1"
      :class="headerClass"
    >
      <app-normal-text
        :class="` ${
          lighterHeader
            ? 'font-medium !text-gray-600'
            : 'font-semibold !text-black !text-sm'
        }  !flex-1`"
      >
        {{ title }}
      </app-normal-text>

      <app-normal-text
        v-if="hasViewMore"
        class="text-primary"
        @click="emit('view-more')"
      >
        {{ actionText }}
      </app-normal-text>
    </div>

    <div class="py-2">
      <div v-if="!hasItems || isLoading" class="w-full">
        <slot name="empty-state">
          <div class="px-4 pt-4 !pt-2 flex flex-col gap-4">
            <app-empty-state
              :title="emptyTitle"
              :description="emptyDescription"
              :useIcon="useEmptyStateIcon"
              :isLoading="isLoading"
              :is-vertical-list="isVerticalList"
            />
            <slot name="empty-state-extra" v-if="!isLoading" />
          </div>
        </slot>
      </div>

      <template v-else>
        <div
          class="flex items-center gap-4 overflow-x-auto h-fit scrollbar-hide px-4"
          :class="contentClass"
        >
          <slot />
        </div>
      </template>

      <slot name="extra-data" />
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
        default: "No data available",
      },
      emptyDescription: {
        type: String,
        default: "",
      },
      useEmptyStateIcon: {
        type: Boolean,
        default: false,
      },
      customClass: {
        type: String,
        default: "",
      },
      headerClass: {
        type: String,
        default: "",
      },
      contentClass: {
        type: String,
        default: "",
      },
      isLoading: {
        type: Boolean,
        default: false,
      },
      hasViewMore: {
        type: Boolean,
        default: true,
      },
      lighterHeader: {
        type: Boolean,
        default: false,
      },
      isVerticalList: {
        type: Boolean,
        default: false,
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
