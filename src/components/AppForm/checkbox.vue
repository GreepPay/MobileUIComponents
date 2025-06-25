<template>
  <div class="flex w-full flex-col space-y-2">
    <div
      @click="selected ? (selected = false) : (selected = true)"
      class="flex w-full flex-row space-x-2 items-center cursor-pointer"
    >
      <app-icon
        v-if="variant == 'normal'"
        :name="`${selected ? 'checkbox-active' : 'checkbox'}`"
        :customClass="`h-[17px]`"
      />

      <app-icon
        v-if="variant == 'switch'"
        :name="`${selected ? 'switch-on' : 'switch-off'}`"
        :customClass="`h-[20px]`"
      />

      <div class="flex flex-row space-x-2 items-center">
        <!-- @slot The content to display next to the checkbox. Use this slot to provide the label for the checkbox. -->
        <slot name="label" />
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import { ref, watch } from "vue";
import AppIcon from "../AppIcon/index.vue";

/**
 *  Checkbox component.
 */
export default {
  components: {
    AppIcon,
  },
  name: "AppCheckbox",
  emits: ["update:modelValue"],
  props: {
    /**
     *  Value of the checkbox, use v-model to bind it.
     */
    modelValue: {
      type: Boolean,
      default: false,
    },
    variant: {
      type: String as () => "normal" | "switch",
      default: "normal",
    },
  },
  setup(props: any, context: any) {
    const selected = ref(props.modelValue);

    watch(
      () => props.modelValue,
      (newValue) => {
        selected.value = newValue;
      }
    );

    watch(selected, () => {
      context.emit("update:modelValue", selected.value);
    });

    return {
      selected,
    };
  },
};
</script>
