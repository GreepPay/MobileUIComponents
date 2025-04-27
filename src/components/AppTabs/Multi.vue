<template>
  <div :class="['w-full overflow-x-auto scrollbar-hide', containerClass]">
    <div
      :class="['inline-flex items-center h-fit flex-wrap gap-2', radiosClass]"
    >
      <app-normal-text
        v-for="(tab, index) in tabs"
        :key="index"
        @click="toggleTab(tab.key)"
        :class="getTabClass(tab.key)"
      >
        {{ tab.label }}
      </app-normal-text>
    </div>
  </div>
</template>

<script lang="ts">
  import { defineComponent, PropType } from "vue"

  export default defineComponent({
    name: "AppMultiTabsSelector", // 👈 New name here
    props: {
      tabs: {
        type: Array as PropType<{ key: string; label: string }[]>,
        required: true,
      },
      selectedKeys: {
        type: Array as PropType<string[]>,
        default: () => [],
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
    },
    emits: ["update:selectedKeys"],
    methods: {
      toggleTab(key: string) {
        const keys = [...this.selectedKeys]
        const index = keys.indexOf(key)
        if (index !== -1) {
          keys.splice(index, 1)
        } else {
          keys.push(key)
        }
        this.$emit("update:selectedKeys", keys)
      },
      getTabClass(tabKey: string) {
        const isActive = this.selectedKeys.includes(tabKey)

        return [
          "px-4 py-2 !text-xs cursor-pointer hover:text-black whitespace-nowrap mr-2",
          this.type === "default" && isActive
            ? "font-bold !text-black"
            : "!text-veryLightGray",
          this.type === "outlined" && isActive
            ? "font-bold !text-black rounded-full border border-black"
            : "!text-veryLightGray border rounded-full",
        ]
      },
    },
  })
</script>
