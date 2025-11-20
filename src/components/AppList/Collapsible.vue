<template>
  <div class="w-full flex flex-col py-4 bg-white" :class="customClass">
    <!-- HEADER -->
    <div
      class="w-full flex justify-between items-center px-4 cursor-pointer select-none"
      :class="headerClass"
      @click="toggle"
    >
      <app-normal-text class="font-semibold !text-black !text-[14px] !flex-1">
        {{ title }}
      </app-normal-text>

      <div class="transition-transform duration-300">
        <app-icon
          name="chevron-down-black"
          :class="{ '-rotate-180': isOpen }"
        />
      </div>
    </div>

    <!-- COLLAPSE -->
    <transition name="collapse">
      <div v-show="isOpen" class="pt-4 pb- 2">
        <div
          v-if="!hasItems || isLoading"
          class="px-4 pt-4 !pt-2 flex flex-col gap-4"
        >
          <app-empty-state
            :title="emptyTitle"
            :description="emptyDescription"
            :useIcon="useEmptyStateIcon"
            :isLoading="isLoading"
          />

          <slot name="empty-state-extra" v-if="!isLoading" />
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
    </transition>
  </div>
</template>

<script lang="ts">
  import { defineComponent, ref, computed } from "vue"
  import { AppNormalText } from "../AppTypography"
  import AppEmptyState from "../AppEmptyState"
  import AppIcon from "../AppIcon"

  export default defineComponent({
    name: "AppCollapsibleList",
    components: {
      AppNormalText,
      AppEmptyState,
      AppIcon,
    },
    props: {
      title: { type: String, default: "Title" },
      items: { type: Array as () => any[], default: () => [] },
      emptyTitle: { type: String, default: "No data available" },
      emptyDescription: { type: String, default: "" },
      useEmptyStateIcon: { type: Boolean, default: false },
      customClass: { type: String, default: "" },
      headerClass: { type: String, default: "" },
      contentClass: { type: String, default: "" },
      isLoading: { type: Boolean, default: false },
      defaultOpen: { type: Boolean, default: false },
    },
    setup(props) {
      const isOpen = ref(props.defaultOpen)

      const toggle = () => {
        isOpen.value = !isOpen.value
      }

      const hasItems = computed(() => props.items.length > 0)

      return { isOpen, toggle, hasItems }
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

  /* Smooth collapse transition */
  .collapse-enter-active,
  .collapse-leave-active {
    transition: all 0.3s ease;
  }
  .collapse-enter-from,
  .collapse-leave-to {
    max-height: 0;
    opacity: 0;
    overflow: hidden;
  }
  .collapse-enter-to,
  .collapse-leave-from {
    max-height: 500px;
    opacity: 1;
    overflow: hidden;
  }
</style>
