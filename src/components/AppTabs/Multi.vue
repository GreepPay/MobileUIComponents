<template>
  <div :class="['w-full overflow-x-auto scrollbar-hide', containerClass]">
    <div
      :class="['inline-flex items-center h-fit flex-wrap gap-y-2', radiosClass]"
    >
      <!-- ALL TAB -->
      <app-normal-text
        v-if="useAll"
        @click="toggleAll"
        :class="getTabClass('ALL')"
        :custom-class="isAllActive && '!text-black'"
        custom-class="!m-0"
      >
        All
      </app-normal-text>
      <app-normal-text
        v-for="(tab, index) in tabs"
        :key="index"
        @click="toggleTab(tab)"
        :class="getTabClass(tab.key)"
        :custom-class="isTabActive(tab.key) && '!text-black'"
        custom-class="!m-0"
      >
        {{ tab.label }}
      </app-normal-text>
    </div>
  </div>
</template>

<script lang="ts">
  import { defineComponent, PropType, watch, computed } from "vue"

  export default defineComponent({
    props: {
      tabs: {
        type: Array as PropType<
          Array<{ key: string; label: string; [k: string]: any }>
        >,
        required: true,
      },

      selectedKeysByCategory: {
        type: Array as PropType<string[]>,
        default: () => [],
      },

      selectedObjects: {
        type: Array as PropType<Array<{ key: string; label: string }>>,
        default: () => [],
      },

      categoryId: {
        type: String,
        required: true,
      },

      selectedCategory: {
        type: Object as PropType<{ id: string; categories: string[] }>,
        default: () => ({ id: "", categories: [] }),
      },

      type: {
        type: String as PropType<"default" | "outlined">,
        default: "default",
      },

      containerClass: {
        type: String,
        default: "",
      },

      radiosClass: {
        type: String,
        default: "",
      },

      useAll: {
        type: Boolean,
        default: false,
      },
    },

    emits: [
      "update:selectedKeys",
      "update:selectedKeysByCategory",
      "update:selectedObjects",
      "update:selectedCategory",
      "update:selectedCategoryGroups", // <-- new emit
    ],

    setup(props, { emit }) {
      const isAllActive = computed(() => {
        return (
          props.useAll &&
          props.selectedKeysByCategory.length === props.tabs.length
        )
      })

      const toggleAll = () => {
        if (isAllActive.value) {
          // unselect all
          emit("update:selectedKeysByCategory", [])
          emit("update:selectedObjects", [])
        } else {
          // select all
          const allKeys = props.tabs.map((t) => t.key)
          const allObjects = [...props.tabs]

          emit("update:selectedKeysByCategory", allKeys)
          emit("update:selectedObjects", allObjects)
        }
      }

      const toggleTab = (tab: any) => {
        const keys = [...props.selectedKeysByCategory]
        const objects = [...props.selectedObjects]

        const keyIndex = keys.indexOf(tab.key)
        const objIndex = objects.findIndex((o) => o.key === tab.key)

        if (keyIndex !== -1) {
          keys.splice(keyIndex, 1)
          objects.splice(objIndex, 1)
        } else {
          keys.push(tab.key)
          objects.push(tab)
        }

        emit("update:selectedKeysByCategory", keys)
        emit("update:selectedObjects", objects)
      }

      const isTabActive = (tabKey: string) => {
        return props.selectedKeysByCategory.includes(tabKey)
      }

      const getTabClass = (tabKey: string) => {
        const isActive =
          tabKey === "ALL" ? isAllActive.value : isTabActive(tabKey)

        const baseClass =
          "px-4 py-2 !text-xs cursor-pointer hover:text-black whitespace-nowrap mr-2"

        return `
        ${baseClass}
        ${
          props.type === "default" && isActive
            ? "!font-bold !text-[#050709] !border-[1.5px] !border-[#050709]"
            : "!text-[#999999] !border !border-[#999999]"
        }
        ${
          props.type === "outlined" && isActive
            ? "!font-bold !text-black !rounded-full !border-[1.5px] !border-[#050709]"
            : " !text-[#999999] !border-[1.5px]  !border-[#999999] rounded-full "
        }
      `
      }

      // Watch selectedKeysByCategory to emit single category payload
      watch(
        () => props.selectedKeysByCategory,
        (value) => {
          const categoryPayload = { id: props.categoryId, categories: value }
          emit("update:selectedCategory", categoryPayload)

          // also emit selectedCategoryGroups array
          emit("update:selectedCategoryGroups", [categoryPayload])
        },
        { deep: true }
      )

      // Computed property if needed internally
      const selectedCategoryGroups = computed(() => {
        return [
          {
            id: props.categoryId,
            categories: [...props.selectedKeysByCategory],
          },
        ]
      })

      return {
        toggleTab,
        getTabClass,
        isTabActive,
        selectedCategoryGroups,
        isAllActive,
        toggleAll,
      }
    },
  })
</script>
