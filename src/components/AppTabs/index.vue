<template>
  <div :class="['w-full overflow-x-auto scrollbar-hide', customClass]">
    <div :class="['inline-flex items-center h-fit', tabsClass]">
      <app-normal-text
        v-for="(tab, index) in tabs"
        :key="index"
        @click="selectTab(tab.key)"
        :class="[getTabClass(tab.key), tabClass]"
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
      tabClass: {
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
          "px-4 py-2 cursor-pointer hover:text-black whitespace-nowrap mr-2"

        if (props.type === "default") {
          return [
            baseClass,
            activeTab.value === tabKey
              ? "!font-[500] !text-black"
              : "!text-veryLightGray",
          ]
        }

        if (props.type === "badge") {
          return [
            baseClass,
            activeTab.value === tabKey
              ? "!font-[500] !text-white !bg-black rounded-full !outline-[1.5px] !outline-black"
              : "!text-veryLightGray border-[1.5px] rounded-full !font-[500]",
          ]
        }
        if (props.type === "outlined") {
          return [
            baseClass,
            activeTab.value === tabKey
              ? "!font-medium !text-black border-[1.5px] !border-black rounded-full !outline-[1.5px] !outline-black"
              : "!text-veryLightGray    rounded-full !font-[500]",
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
