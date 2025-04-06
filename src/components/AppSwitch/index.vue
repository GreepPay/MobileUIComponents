<template>
  <div
    class="w-full flex no-scrollbar flex-row space-x-3 flex-nowrap overflow-x-auto scrollbar-hide"
    :id="`switchContainer${uniqueId}`"
  >
    <div class="flex flex-row py-2 pr-4">
      <div
        :class="`flex flex-row ${
          index === 0 ? 'pl-4' : '!pl-2'
        } pl-2 cursor-pointer`"
        v-for="(item, index) in items"
        :key="index"
        @click="currentSelectedItem = item.key"
        :id="`item${item.key}`"
      >
        <div
          :class="` ${
            currentSelectedItem == item.key
              ? 'bg-[#0A141E] border-[#0A141E]'
              : 'bg-transparent border-[#E0E2E4]'
          } px-4 py-2 rounded-full w-auto flex flex-row items-center justify-center border-[1.5px]`"
        >
          <app-normal-text
            :custom-class="`!whitespace-nowrap ${
              currentSelectedItem == item.key
                ? '!text-white'
                : '!text-[#999999]'
            } `"
          >
            {{ item.name }}
          </app-normal-text>
        </div>
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import { defineComponent, onMounted, ref, watch } from "vue";
import { AppNormalText } from "../AppTypography";
import { scrollToSpecificItem } from "../../composable";
export default defineComponent({
  components: {
    AppNormalText,
  },
  props: {
    customClass: {
      type: String,
      required: false,
    },
    items: {
      type: Array as () => {
        name: string;
        key: string;
      }[],
      default: () => [],
    },
  },
  name: "AppSwitch",
  emits: ["update:modelValue"],
  setup(props, context) {
    const currentSelectedItem = ref("");

    const uniqueId = ref(Math.random().toString(36).substring(2, 15));

    onMounted(() => {
      if (props.items.length) {
        currentSelectedItem.value = props.items[0].key;
      }
    });

    watch(currentSelectedItem, () => {
      context.emit("update:modelValue", currentSelectedItem.value);
    });

    const focusOnItem = (index: string) => {
      scrollToSpecificItem(`switchContainer${uniqueId.value}`, `item${index}`);
    };

    watch(currentSelectedItem, () => {
      // focusOnItem(currentSelectedItem.value);
    });

    return {
      currentSelectedItem,
      uniqueId,
    };
  },
});
</script>
