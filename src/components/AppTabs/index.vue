<template>
  <div :class="['w-full overflow-x-auto scrollbar-hide', customClass]">
    <div class="inline-flex items-center h-fit">
      <app-normal-text
        v-for="(tab, index) in tabs"
        :key="index"
        @click="selectTab(tab.key)"
        :class="[
          'pr-4 py-2 !text-sm cursor-pointer hover:text-black whitespace-nowrap',
          activeTab === tab.key
            ? 'font-bold !text-[#0A141E]'
            : '!text-[#999999] ',
        ]"
      >
        {{ tab.label }}
      </app-normal-text>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from "vue";
import { AppNormalText } from "../AppTypography";

export default defineComponent({
  name: "AppTabs",
  components: { AppNormalText },
  props: {
    tabs: {
      type: Array as () => { key: string; label: string }[],
      required: true,
    },
    customClass: {
      type: String,
      default: "",
    },
    defaultTab: {
      type: String,
      default: "",
    },
  },
  emits: ["update:activeTab"],
  setup(props, { emit }) {
    const activeTab = ref(props.defaultTab || props.tabs[0]?.key || "");

    const selectTab = (key: string) => {
      activeTab.value = key;
      emit("update:activeTab", key);
    };

    return { activeTab, selectTab };
  },
});
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
