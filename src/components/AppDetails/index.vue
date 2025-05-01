<template>
  <div
    class="w-full flex flex-col px-4 rounded-[16px] border-[1.5px] !border-[#F0F3F6]"
  >
    <template v-for="(item, index) in details" :key="index">
      <div
        :class="`flex py-4 px-1 w-full  ${
          isVertical
            ? 'flex-col space-y-1'
            : 'items-center justify-between space-x-3'
        } ${index !== 0 && 'border-t border-[#F0F3F6]'}`"
      >
        <app-normal-text
          :class="` capitalize ${
            invertBoldness
              ? '!font-[500] !text-[#0A141E] !text-sm'
              : '!text-[#616161]'
          }`"
        >
          {{ item.title }}
        </app-normal-text>
        <app-normal-text
          :class="` ${
            invertBoldness ? '!text-[#616161]' : '!font-[500] !text-[#0A141E]'
          } !text-sm`"
        >
          {{ item.content }}
        </app-normal-text>
      </div>
    </template>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { AppNormalText, AppHeaderText } from "../AppTypography";

/**
 * AppDetails Component
 *
 * This component dynamically renders a list of details from an object.
 * Each entry is displayed with a label (formatted key) and value.
 *
 * Props:
 * @prop {Record<string, string>} details - The object containing key-value pairs.
 */
export default defineComponent({
  name: "AppDetails",
  components: { AppNormalText, AppHeaderText },
  props: {
    /**
     * Object containing key-value pairs to display.
     * @required
     */
    details: {
      type: Array as () => {
        title: string;
        content: string;
      }[],
      required: true,
    },
    isVertical: {
      type: Boolean,
      default: true,
    },
    invertBoldness: {
      type: Boolean,
      default: false,
    },
  },
});
</script>
