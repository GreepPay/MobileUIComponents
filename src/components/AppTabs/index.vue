<template>
  <div :class="['w-full overflow-x-auto scrollbar-hide', customClass]">
    <div :class="['inline-flex items-center h-fit', tabsClass]">
      <app-normal-text
        v-for="(tab, index) in tabs"
        :key="index"
        @click="selectTab(tab.key)"
        :class="getTabClass(tab.key)"
      >
        {{ tab.label }}
      </app-normal-text>
    </div>
  </div>
</template>

<script lang="ts">
  import { defineComponent, ref } from "vue"
  import { AppNormalText } from "../AppTypography"

  export default defineComponent({
    name: "AppTabs",
    components: { AppNormalText },
    props: {
      tabs: {
        type: Array as () => { key: string; label: string }[],
        required: true,
      },
      type: {
        type: String,
        default: "default",
      },
      customClass: {
        type: String,
        default: "",
      },
      tabsClass: {
        type: String,
        default: "flex-nowrap ", // flex-nowrap is default now
      },
      defaultTab: {
        type: String,
        default: "",
      },
    },
    emits: ["update:activeTab"],
    setup(props, { emit }) {
      const activeTab = ref(props.defaultTab || props.tabs[0]?.key || "")

      const selectTab = (key: string) => {
        activeTab.value = key
        emit("update:activeTab", key)
      }
      const getTabClass = (tabKey: string) => {
        const baseClass =
          "px-4 py-2 !text-xs cursor-pointer hover:text-black whitespace-nowrap mr-2"

        if (props.type === "default") {
          return [
            baseClass,
            activeTab.value === tabKey
              ? "font-bold !text-black"
              : "!text-veryLightGray",
          ]
        }

        if (props.type === "badge") {
          return [
            baseClass,
            activeTab.value === tabKey
              ? "font-bold !text-white !bg-black rounded-full border"
              : "!text-veryLightGray border rounded-full",
          ]
        }

        return baseClass
      }

      return { activeTab, selectTab, getTabClass }
    },
  })
</script>

<style scoped>
  /* Hide scrollbar */
  .scrollbar-hide::-webkit-scrollbar {
    display: none;
  }

  .scrollbar-hide {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
</style>
