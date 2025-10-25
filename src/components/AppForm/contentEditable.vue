<template>
  <span
    contenteditable="true"
    :class="`focus:!outline-0`"
    @input="handleInput"
    @focus="handleFocus"
    @blur="handleBlur"
    @keypress="isNumber"
    ref="editable"
    :data-placeholder="placeholder"
    :inputmode="type === 'number' || type === 'tel' ? 'numeric' : 'text'"
  >
  </span>
</template>

<script lang="ts">
import { ref, defineComponent, onMounted, watch, nextTick } from "vue";
import { Logic } from "../../composable";

export default defineComponent({
  name: "AppContentEditable",
  props: {
    placeholder: {
      type: String,
      default: "",
    },
    defaultValue: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      default: "text",
    },
    customClass: {
      type: String,
      default: "",
    },
    listenForUpdate: {
      type: Boolean,
      default: false,
    },
    isFormatted: {
      type: Boolean,
      default: false,
    },
  },
  emits: ["update:modelValue", "contentChanged"],
  setup(props, context) {
    const editable = ref<HTMLElement | null>(null);

    // Track the actual content
    const content = ref(props.defaultValue);

    const formatNumber = (number: string) => {
      if (!number) return "";

      const num = number.replace(/[^0-9]/g, ""); // Remove non-numeric characters
      if (!num) return "";

      return num.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    };

    const applyFormatting = (value: string) => {
      if (props.isFormatted && value.length > 1) {
        return Logic.Common.convertToMoney(
          value ? value.toString().replace(/,/g, "") || 0 : 0,
          false,
          "",
          false
        );
      }
      return value;
    };

    const setContentAndPositionCursor = (newContent: string) => {
      if (editable.value) {
        editable.value.textContent = newContent;
        content.value = newContent;
        //set cursor to the end
        nextTick(() => {
          const range = document.createRange();
          range.selectNodeContents(editable.value!);
          range.collapse(false);
          const sel = window.getSelection();
          sel?.removeAllRanges();
          sel?.addRange(range);
        });
      }
    };

    onMounted(() => {
      let initialValue = props.defaultValue;
      if (props.type === "number" || props.type === "tel") {
        initialValue = formatNumber(props.defaultValue);
      }
      setContentAndPositionCursor(initialValue);
    });

    const handleInput = (event: any) => {
      let innerText = event.target.innerText;
      const formattedValue = props.isFormatted
        ? applyFormatting(innerText)
        : innerText;

      context.emit("update:modelValue", innerText); // Emit raw value
      setContentAndPositionCursor(formattedValue); //set formatted value to the contenteditable
      context.emit("contentChanged", innerText); // Emit raw value
    };

    const handleFocus = () => {
      //Placeholder will be handled by css
    };

    const handleBlur = () => {
      //Placeholder will be handled by css
    };

    const focus = () => {
      if (editable.value) {
        editable.value.focus();
        nextTick(() => {
          const range = document.createRange();
          range.selectNodeContents(editable.value!);
          range.collapse(false);
          const selection = window.getSelection();
          selection?.removeAllRanges();
          selection?.addRange(range);
        });
      }
    };

    watch(
      () => props.defaultValue,
      (newVal) => {
        let formattedValue = newVal;

        if (props.isFormatted) {
          formattedValue = applyFormatting(newVal);
        } else if (props.type === "number" || props.type === "tel") {
          formattedValue = formatNumber(newVal);
        }
        setContentAndPositionCursor(formattedValue);
      }
    );

    const isNumber = (evt: any) => {
      if (props.type != "tel" && props.type != "number") return true;

      evt = evt ? evt : window.event;
      var charCode = evt.which ? evt.which : evt.keyCode;
      if (
        charCode > 31 &&
        (charCode < 48 || charCode > 57) &&
        charCode !== 46
      ) {
        evt.preventDefault();
      } else {
        return true;
      }
    };

    return {
      editable,
      handleInput,
      handleFocus,
      handleBlur,
      isNumber,
      focus,
    };
  },
});
</script>
<style scoped>
[contenteditable]:empty:before {
  content: attr(data-placeholder);
  color: #999999;
  pointer-events: none;
}
</style>
