<template>
  <div class="flex w-full flex-col space-y-2">
    <div class="w-full grid grid-cols-12 gap-6">
      <div
        class="col-span-4 flex flex-row items-center justify-center"
        v-for="(key, index) in Array.from(Array(9).keys())"
        :key="index"
      >
        <!-- Max of 2 decimal places -->
        <span
          @click="
            handleClick($event, () =>
              canAddNumber ? (content += `${key + 1}`) : null
            )
          "
          class="w-[43px] h-[43px] xs:w-[38px] xs:h-[38px] rounded-full border-[1px] border-transparent hover:!bg-gray-100 flex flex-row items-center justify-center transition-colors duration-200"
          :class="{ 'bg-gray-200': activeKey === `key-${index}` }"
          :data-key-id="`key-${index}`"
        >
          <app-normal-text class="!text-xl font-semibold">
            {{ key + 1 }}
          </app-normal-text>
        </span>
      </div>
      <div class="col-span-4 flex flex-row items-center justify-center">
        <span
          @click="
            handleClick($event, () =>
              content.includes('.') ? null : (content += '.')
            )
          "
          class="w-[43px] h-[43px] xs:w-[38px] xs:h-[38px] rounded-full border-[1px] border-transparent hover:!bg-gray-100 flex flex-row items-center justify-center transition-colors duration-200"
          :class="{ 'bg-gray-200': activeKey === 'key-dot' }"
          data-key-id="key-dot"
        >
          <app-normal-text
            class="!text-xl !font-semibold xs:text-sm text-center"
          >
            .
          </app-normal-text>
        </span>
      </div>
      <div class="col-span-4 flex flex-row items-center justify-center">
        <span
          @click="handleClick($event, () => (content += '0'))"
          class="w-[43px] h-[43px] xs:w-[38px] xs:h-[38px] rounded-full border-[1px] border-transparent hover:!bg-gray-100 flex flex-row items-center justify-center transition-colors duration-200"
          :class="{ 'bg-gray-200': activeKey === 'key-zero' }"
          data-key-id="key-zero"
        >
          <app-normal-text class="!text-xl !font-semibold"> 0 </app-normal-text>
        </span>
      </div>
      <div class="col-span-4 flex flex-row items-center justify-center">
        <span
          @click="handleClick($event, () => (content = content.slice(0, -1)))"
          class="w-[43px] h-[43px] xs:w-[38px] xs:h-[38px] rounded-full border-[1px] border-transparent hover:!bg-gray-100 flex flex-row items-center justify-center transition-colors duration-200"
          :class="{ 'bg-gray-200': activeKey === 'key-backspace' }"
          data-key-id="key-backspace"
        >
          <app-icon name="delete-number" custom-class="!h-[13px]" />
        </span>
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import AppNormalText from "../AppTypography/normalText.vue";
import AppIcon from "../AppIcon";
import { computed, onMounted, ref, toRef, watch } from "vue";

/**
 *  A number keyboard component.
 */
export default {
  components: {
    AppNormalText,
    AppIcon,
  },
  props: {
    /**
     * Determines if the fingerprint icon should be displayed (Not used).
     */
    hasFingerPrint: {
      type: Boolean,
      default: true,
    },
    /**
     * The v-model value for the keyboard input.  Updates the parent with the entered value.
     */
    modelValue: {
      required: false,
    },

    /**
     * The v-model value for the keyboard input.  Updates the parent with the entered value.
     */
    updateValue: {
      required: false,
    },
  },
  name: "AppKeyboard",
  emits: ["update:modelValue"],
  setup(props: any, context: any) {
    const content = ref("");
    const activeKey = ref("");
    const updateValueRef = toRef(props, "updateValue");

    const handleClick = (event: Event, callback: Function) => {
      const target = event.currentTarget as HTMLElement;
      const keyId = target.getAttribute("data-key-id");
      if (keyId) {
        activeKey.value = keyId;
      }
      callback();

      setTimeout(() => {
        activeKey.value = "";
      }, 150);
    };

    watch(content, () => {
      // Strip out first char if it's 0
      if (content.value.startsWith("0")) {
        content.value = content.value.slice(1);
      }
      context.emit("update:modelValue", content.value);
    });

    watch(updateValueRef, () => {
      if (updateValueRef.value) {
        content.value = updateValueRef.value;
      }
    });

    watch(props, () => {
      if (props.modelValue == "") {
        content.value = "";
      }
    });

    const isFocused = ref(false);

    const tabIndex = Math.random();

    const canAddNumber = computed(() => {
      let contentArray = content.value.split(".");
      if (contentArray.length > 1) {
        let charAfterDot = contentArray[1].length;
        if (charAfterDot >= 2) {
          return false;
        }
      }
      return true;
    });

    onMounted(() => {
      if (props.modelValue) {
        content.value = props.modelValue;
      }
    });

    return {
      content,
      tabIndex,
      isFocused,
      canAddNumber,
      activeKey,
      handleClick,
    };
  },
};
</script>
