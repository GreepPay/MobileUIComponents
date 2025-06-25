<template>
  <div class="flex w-full flex-col">
    <div
      v-for="(option, index) in options"
      :key="index"
      @click.stop="selectedOption = option.key"
      class="flex w-full flex-row items-center justify-between cursor-pointer py-3 border-b-[1px] border-gray-300 mb-2"
    >
      <div class="flex flex-row space-x-2 items-center justify-between w-full">
        <div class="flex flex-row space-x-2 items-center justify-start">
          <span class="h-full flex items-start justify-center">
            <span
              :class="`h-[11px] w-[11px] rounded-full ${
                selectedOption == option.key ? 'bg-primary' : 'bg-[#D9D9D9]'
              }`"
            >
            </span>
          </span>
          <app-normal-text>
            {{ option.altValue ? option.altValue : option.value }}
          </app-normal-text>
        </div>
        <template v-if="option.isImage != true">
          <app-normal-text
            custom-class="font-semibold!"
            color="text-primary!"
            v-if="!option.hasIcon"
          >
            {{ option.extras }}
          </app-normal-text>
          <app-icon
            :name="option.extras || ''"
            :custom-class="`${
              option.extras == 'mastercard' ? 'h-[16px]' : 'h-[11px]'
            }`"
            v-if="option.hasIcon && option.extras"
          />
        </template>

        <img v-else :src="`${option.extras}`" class="h-[25px] w-auto" />
        <!--
         * @slot This slot allows you to customize the content displayed on the right side of each radio button option.
         -->
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import AppNormalText from "../AppTypography/normalText.vue";
import { defineComponent, onMounted, ref, watch } from "vue";
import { SelectOption } from "../../types";
import AppIcon from "../AppIcon";

/**
 * Radio button group component.
 */
export default defineComponent({
  components: {
    AppNormalText,
    AppIcon,
  },
  props: {
    /**
     * Array of options for the radio group.
     */
    options: {
      type: Array as () => SelectOption[],
      required: true,
      /**
       * Example options:
       * ```
       * [
       *   { key: 'option1', value: 'Option 1', extras: 'Extra Info 1' },
       *   { key: 'option2', value: 'Option 2', extras: 'Extra Info 2' }
       * ]
       * ```
       */
    },
    /**
     * The currently selected value.  Use v-model to bind to this prop.
     */
    modelValue: {
      required: false,
      type: String,
      default: "",
    },
  },
  name: "AppRadio",
  emits: ["update:modelValue"],
  setup(props: any, context: any) {
    const selectedOption = ref("");

    watch(selectedOption, () => {
      context.emit("update:modelValue", selectedOption.value);
    });

    onMounted(() => {
      if (props.modelValue) {
        selectedOption.value = props.modelValue;
      }
    });

    return {
      selectedOption,
    };
  },
});
</script>
