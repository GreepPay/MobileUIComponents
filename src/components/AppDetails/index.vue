<template>
  <div
    class="w-full flex flex-col px-4 rounded-[16px] border-[1.5px] !border-[#F0F3F6]"
  >
    <template v-for="(item, index) in details" :key="index">
      <div
        :class="`flex py-4 px-1 w-full  ${
          isVertical
            ? 'flex-col space-y-1'
            : 'items-center justify-between space-x-3 flex-row'
        } ${index !== 0 && 'border-t border-[#F0F3F6]'}`"
      >
        <app-normal-text
          :class="` !whitespace-nowrap ${
            invertBoldness ? '!font-[500] !text-[#0A141E]' : '!text-gray-500'
          }`"
        >
          {{ capitalize(item.title) }}
        </app-normal-text>
        <div class="w-full flex flex-row items-center justify-end">
          <app-normal-text
            :class="` !text-right ${
              invertBoldness ? '!text-gray-500' : '!font-[500] !text-[#0A141E]'
            } !text-[12.5px] break-words`"
            is-html
            :htmlContent="capitalize(item.content.replaceAll('_', ' '))"
          >
          </app-normal-text>
          <div
            v-if="item.can_copy"
            @click="Logic.Common.copytext(item.content)"
            class="flex flex-row items-center cursor-pointer"
          >
            <app-normal-text
              :class="`!text-primary !text-xs !font-normal cursor-pointer mr-1`"
            >
              Copy
            </app-normal-text>
            <app-icon name="copy" class="h-[23px] w-[23px] cursor-pointer" />
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script lang="ts">
import { defineComponent, capitalize } from "vue";
import { AppNormalText, AppHeaderText } from "../AppTypography";
import AppIcon from "../AppIcon";
import { Logic } from "../../composable";

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
  components: { AppNormalText, AppHeaderText, AppIcon },
  props: {
    /**
     * Object containing key-value pairs to display.
     * @required
     */
    details: {
      type: Array as () => {
        title: string;
        content: string;
        can_copy?: boolean;
      }[],
      required: true,
    },
    isVertical: {
      type: Boolean,
      default: false,
    },
    customClass: {
      type: String,
      default: "",
    },
    invertBoldness: {
      type: Boolean,
      default: false,
    },
  },
  setup(props) {
    return { Logic, capitalize };
  },
});
</script>
