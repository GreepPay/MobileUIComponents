<template>
  <div class="flex flex-row items-center gap-4 space-x-1 z-40">
    <span
      v-for="index in numberOfInput"
      :key="index - 1 + '' + uniqueKey"
      :class="`${inputHasContent('' + uniqueKey + index) ? '' : ''}`"
    >
      <input
        :id="'' + uniqueKey + (index - 1)"
        v-model="otps[index - 1]"
        :type="type"
        :class="`md:w-[64px] [box-shadow:0_0_0_1.5px_#E0E2E4] rounded-[12px] md:h-[64px] w-[64px] h-[64px] text-lg text-center focus:outline-hidden bg-lightGrayVaraint! custom-border ${sizeStyle}`"
        :disabled="isDisabled"
        @keypress="onKeyPress"
        @keyup.right="focusInputByRef('' + uniqueKey + (index + 1))"
        @keyup.left="focusInputByRef('' + uniqueKey + (index - 1))"
        @keyup.delete="focusInputByRef('' + uniqueKey + (index - 1))"
        @paste="onPaste"
        @input="
          onInput($event, '' + uniqueKey + index);
          setValue();
        "
      />
    </span>
  </div>
  <!--
   * @slot This component does not have any slots.
   -->
</template>

<script lang="ts">
import { ref, computed, watch, defineComponent, onMounted } from "vue";

/**
 * OTP Input component for entering numeric OTP codes.
 */
export default defineComponent({
  name: "AppOTPInput",

  props: {
    /**
     * Disables all input fields in the OTP input.
     */
    isDisabled: {
      type: Boolean,
      required: false,
      default: false,
    },
    /**
     * Indicates whether the OTP input should display an error state.
     */
    isError: {
      type: Boolean,
      required: false,
      default: false,
    },
    /**
     * When set to true, resets the OTP input to an empty state.
     */
    shouldResetOTP: {
      type: Boolean,
      required: false,
      default: false,
    },
    /**
     * The number of input fields to render for the OTP code.
     */
    numberOfInput: {
      type: Number,
      required: false,
      default: 4,
    },
    /**
     * Styles to apply when the OTP input is in an error state.
     */
    error: {
      type: Object,
      required: false,
      default: function () {
        return {
          "border-color": "red",
        };
      },
    },
    /**
     * Callback function triggered when the OTP value changes.  Receives the current OTP value as an argument.
     */
    onChangeOTP: {
      type: Function,
      required: true,
    },
    /**
     * The input type for the OTP fields. Defaults to 'text'.  Consider using 'tel' for number-only input on mobile devices.
     */
    type: {
      type: String,
      default: "text",
    },
    sizeStyle: {
      type: String,
      default: "",
    },
    otpValue: {
      type: String,
      default: "",
    },
  },
  emits: ["update:modelValue", "update:filled"],
  setup(props, context) {
    const uniqueKey =
      Math.random().toString(36).substring(2, 15) +
      Math.random().toString(36).substring(2, 15);

    const otps = ref<String[]>([]);

    const otp = computed(() => {
      return otps.value.join("");
    });

    const isOtpFilled = computed(() => {
      return otp.value.length === props.numberOfInput;
    });

    watch(isOtpFilled, (newValue) => {
      if (newValue) {
        context.emit("update:filled", true);
      }
    });

    const shouldResetOTP = ref(false);

    const inputStyle = computed(() => {
      if (props.isError) {
        return {
          ...props.error,
        };
      }
    });

    const resetOTPInput = () => {
      otps.value = [];
    };

    const watchResetOtp = (newProp: boolean, oldProp: boolean) => {
      if (newProp === !oldProp) {
        resetOTPInput();
      }
    };

    watch(shouldResetOTP, watchResetOtp);

    const onKeyPress = (event: any) => {
      if (event.target.value.length === 1) {
        return event.preventDefault();
      }
    };

    const focusInputByRef = (id: any) => {
      const element = document.getElementById(id);
      if (element) {
        element.focus();
      }
    };

    const onInput = (event: any, id: string) => {
      props.onChangeOTP(otp.value);
      if (event.inputType === "deleteContentBackward") return false;

      focusInputByRef(id);

      event.preventDefault();
    };

    const setValue = () => {
      context.emit("update:modelValue", otp.value);
    };

    const setInputValue = (id: string, value: string) => {
      if (document.getElementById(id)) {
        otps.value[parseInt(id.replace(uniqueKey, ""))] = value;
        (document.getElementById(id) as HTMLInputElement).value = value;
      }
    };

    watch(props, () => {
      fillOtpInput();
    });

    const fillOtpInput = () => {
      for (let index = 0; index < props.numberOfInput; index++) {
        const inputId = "" + uniqueKey + index;
        setInputValue(inputId, "");
      }

      // set string value
      let finalOtp =
        props.otpValue.length > props.numberOfInput
          ? props.otpValue.substring(0, props.numberOfInput)
          : props.otpValue;

      const otpArray = finalOtp.split("");

      if (otpArray.length <= props.numberOfInput) {
        for (let index = 0; index < otpArray.length; index++) {
          const inputId = "" + uniqueKey + index;
          const otpValue = otpArray[index];
          setInputValue(inputId, otpValue);
          if (otpArray.length == props.numberOfInput) {
            context.emit("update:filled", props.otpValue);
          }
        }
      }
    };

    const onPaste = (event: any) => {
      // Getting copy text
      const clipboardData =
        event.clipboardData || event.originalEvent.clipboardData;
      const pastedData = clipboardData.getData("Text");
      const arrayOfNumbers = pastedData.split("");

      // set the length to numberOfInput
      if (arrayOfNumbers.length > props.numberOfInput)
        arrayOfNumbers.slice(0, props.numberOfInput);

      otps.value = arrayOfNumbers;

      // focus the last input element according to length
      const id = `${uniqueKey}${arrayOfNumbers.length}`;
      focusInputByRef(id);

      event.preventDefault();
      setValue();
    };

    const inputHasContent = (id: string) => {
      const inputValue = (document.getElementById(id) as HTMLInputElement)
        ?.value;

      return inputValue ? inputValue.length > 0 : false;
    };

    onMounted(() => {
      fillOtpInput();
    });

    return {
      otp,
      inputStyle,
      onPaste,
      onInput,
      onKeyPress,
      focusInputByRef,
      otps,
      setValue,
      uniqueKey,
      inputHasContent,
    };
  },
});
</script>
