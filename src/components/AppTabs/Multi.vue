<template>
  <div :class="['w-full overflow-x-auto scrollbar-hide', containerClass]">
    <div
      :class="['inline-flex items-center h-fit flex-wrap gap-2', radiosClass]"
    >
      <app-normal-text
        v-for="(tab, index) in tabs"
        :key="index"
        @click="toggleTab(tab)"
        :class="getTabClass(tab.key)"
        :custom-class="isTabActive(tab.key) && '!text-black'"
      >
        {{ tab.label }}
      </app-normal-text>
    </div>
  </div>
</template>

<script lang="ts">
  import { defineComponent, PropType } from "vue"

  export default defineComponent({
    props: {
      tabs: {
        type: Array as PropType<
          Array<{ key: string; label: string; [k: string]: any }>
        >,
        required: true,
      },

      /** v-model: selectedKeys */
      selectedKeys: {
        type: Array as PropType<string[]>,
        default: () => [],
      },

      /** v-model: selectedObjects */
      selectedObjects: {
        type: Array as PropType<Array<{ key: string; label: string }>>,
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

    emits: ["update:selectedKeys", "update:selectedObjects"],

    setup(props, { emit }) {
      const toggleTab = (tab: any) => {
        const keys = [...props.selectedKeys]
        const objects = [...props.selectedObjects]

        const keyIndex = keys.indexOf(tab.key)
        const objIndex = objects.findIndex((o) => o.key === tab.key)

        if (keyIndex !== -1) {
          // remove
          keys.splice(keyIndex, 1)
          objects.splice(objIndex, 1)
        } else {
          // add
          keys.push(tab.key)
          objects.push(tab)
        }

        emit("update:selectedKeys", keys)
        emit("update:selectedObjects", objects)
      }

      const isTabActive = (tabKey: string) => {
        return props.selectedKeys.includes(tabKey)
      }

      const getTabClass = (tabKey: string) => {
        const isActive = isTabActive(tabKey)
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

      return {
        toggleTab,
        getTabClass,
        isTabActive,
      }
    },
  })
</script>
