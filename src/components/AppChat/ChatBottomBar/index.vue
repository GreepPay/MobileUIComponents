<template>
  <div
    :class="`w-full flex flex-col fixed bottom-0 left-0 py-4 !border-t-[1.5px] !border-[#F0F3F6] bg-white z-5 ${
      chatEnabled ? '' : '!opacity-[50%]'
    }`"
    :style="bottomPadding"
  >
    <!-- Extra widget slot -->
    <slot name="extra-widget" />

    <!-- Proof upload section for sellers -->
    <div
      v-if="isSeller && showProofUpload"
      class="w-full px-4 mb-2 flex flex-row items-center"
    >
      <app-normal-text class="!text-left !max-w-[50%] !text-gray-500">
        Upload a proof of cash delivery
      </app-normal-text>
      <div class="w-[50%] flex flex-col">
        <app-button
          class="w-full !py-3"
          variant="primary"
          @click="openProofUpload"
        >
          Upload
        </app-button>
      </div>
    </div>

    <!-- Main input text area -->
    <div
      class="w-full flex flex-row px-4 items-center justify-between overflow-hidden max-w-full"
    >
      <div class="flex flex-row items-center w-full max-w-[calc(100%-56px)]">
        <!-- Regular text input -->
        <span
          v-if="!showAddressMode"
          :contenteditable="chatEnabled"
          role="textbox"
          ref="editable"
          :class="`w-full textarea prose prose-sm relative !text-xs resize-none !min-h-[55px] border-[1.5px] border-[#E0E2E4] text-black whitespace-pre-wrap focus:outline-none !max-h-[80px] overflow-x-hidden bg-transparent rounded-full py-3 pt-4 pl-4 px-3 items-start text-left overflow-y-auto`"
          :placeholder="placeholder"
          id="messageContainerInput"
          :data-placeholder="placeholder"
          @input="onInput"
          @keypress="handleKeyEvent"
          :inputmode="inputmode"
        >
        </span>

        <!-- Address input mode -->
        <div
          v-else
          @click="$emit('click-address-input')"
          :class="`w-full textarea prose prose-sm relative !text-xs resize-none !min-h-[55px] border-[1.5px] border-[#2563EB] text-blue-700 whitespace-pre-wrap focus:outline-none !max-h-[80px] overflow-x-hidden bg-blue-50 rounded-full py-3 pt-4 pl-4 px-3 text-left overflow-y-auto cursor-pointer flex items-center`"
        >
          <span class="flex items-center space-x-2">
            <span>📍</span>
            <span>Tap to enter your delivery address...</span>
          </span>
        </div>
      </div>

      <div class="w-[56px] ml-3">
        <div
          @click="
            showAddressMode ? $emit('click-address-input') : sendMessageInner()
          "
          :class="`w-[56px] h-[56px] rounded-full ${
            showAddressMode
              ? 'bg-[#2563EB]'
              : chatEnabled
              ? 'bg-[#0A141E]'
              : 'bg-gray-300'
          } items-center justify-center flex flex-row ${
            chatEnabled ? 'cursor-pointer' : 'cursor-not-allowed'
          }`"
        >
          <div class="w-[24px]">
            <span v-if="showAddressMode" class="text-white text-lg">📍</span>
            <app-icon
              v-else
              name="send"
              :custom-class="`!h-[24px] ${
                chatEnabled ? 'text-white' : 'text-gray-500'
              }`"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- Amount exchange in USD -->
    <div class="w-full flex flex-col px-4" v-if="showUSDAmount">
      <div
        :class="`w-full flex flex-row justify-between items-center px-3 py-2 mt-3 ${
          USDAmountIsValid ? 'bg-gray-100' : '!bg-red/10  '
        } rounded-[6px]  `"
      >
        <div class="flex flex-row space-x-[2px]">
          <span class="!text-gray-600">You will get:</span>
          <span class="!font-semibold">
            ${{ Logic.Common.convertToMoney(amountInUSD, true, "") }}
          </span>
        </div>

        <div class="flex flex-row !text-[12px] text-gray-500">
          (Minimum: ${{
            Logic.Common.convertToMoney(minimumUSDAmount, true, "")
          }})
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import {
  computed,
  defineComponent,
  onMounted,
  toRef,
  watch,
  nextTick,
  ref,
} from "vue";
import AppIcon from "../../AppIcon/index.vue";
import AppButton from "../../AppButton/index.vue";
import { AppNormalText } from "../../AppTypography";
import {
  Conversation,
  ExchangeAd,
  Participant,
} from "@greep/logic/src/gql/graphql";
import {
  getChatMetadata,
  participantOwnExchangeAd,
  useWorkflowEngine,
} from "../../../composable/useWorkflowEngine";
import { Logic } from "../../../composable";

type InputMode =
  | "search"
  | "text"
  | "email"
  | "tel"
  | "none"
  | "url"
  | "numeric"
  | "decimal";

export default defineComponent({
  name: "ChatBottomBar",
  components: {
    AppIcon,
    AppButton,
    AppNormalText,
  },
  props: {
    conversation: {
      type: Object as () => Conversation,
      required: true,
    },
    sendMessage: {
      type: Function,
      required: true,
    },
    lastAIMessage: {
      type: Object,
      default: () => ({}),
    },
    showAddressMode: {
      type: Boolean,
      default: false,
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    orderConfirmed: {
      type: Boolean,
      default: false,
    },
    proofUploaded: {
      type: Boolean,
      default: false,
    },
    authUser: {
      type: Object,
      default: () => ({}),
    },
    bottomPadding: {
      type: String,
      default: "",
    },
  },
  emits: ["click-address-input", "upload-proof"],
  setup(props, { emit }) {
    const editable = ref<HTMLElement | null>(null);
    const chatEnabled = ref(true);
    const placeholder = ref("Enter amount");
    const chatContent = ref("");
    const lastAIMessageRef = toRef(props, "lastAIMessage");
    const inputmode = ref<InputMode>("text");
    const showUSDAmount = ref(false);
    const minimumUSDAmount = ref(2);
    const localExchangeRate = ref(0);

    // Check if user is seller
    const isSeller = computed(() => {
      const participants = props.conversation?.participants || [];
      const currentUserId = props.authUser?.id;

      if (!currentUserId || !participants.length) {
        return false;
      }

      const currentUserIdNum = parseInt(currentUserId);

      const currentParticipant = participants?.find(
        (item) => item.user_id == currentUserIdNum
      );

      // Check if current user is the owner (conversation creator)

      const exchangeAd = props?.conversation?.exchangeAd;

      const adType = exchangeAd?.ad_type;

      const participantIsAdOwner = participantOwnExchangeAd(
        currentParticipant,
        exchangeAd
      );

      let allowUploadProof = false;

      if (adType == "sell" && participantIsAdOwner) {
        allowUploadProof = true;
      }

      // if (adType == "buy" && !participantIsAdOwner) {
      //   allowUploadProof = true;
      // }

      return allowUploadProof;
    });

    // Check if proof upload should be shown
    const showProofUpload = computed(() => {
      const stage =
        props.conversation?.stage?.replaceAll("_0", "")?.replaceAll("_1", "") ||
        "";
      return (
        (stage === "send_payment" || stage.includes("payment")) &&
        !props.proofUploaded
      );
    });

    const openProofUpload = () => {
      emit("upload-proof");
    };

    const isFormatted = computed(() => {
      return inputmode.value == "tel" || inputmode.value == "numeric";
    });

    const setContentAndPositionCursor = (newContent: string) => {
      if (editable.value) {
        editable.value.textContent = newContent;
        chatContent.value = newContent;
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

    const onInput = (event: any) => {
      const innerText = event.target.innerText || "";

      if (isFormatted.value) {
        // Normalize to digits and at most one dot (decimal)
        let numericOnly = innerText.replace(/[^0-9.]/g, "");
        // keep only first dot if multiple
        const parts = numericOnly.split(".");
        if (parts.length > 1) {
          numericOnly = parts.shift() + "." + parts.join("");
        }

        // If empty or just ".", keep as is (no formatting)
        if (numericOnly === "" || numericOnly === ".") {
          setContentAndPositionCursor(numericOnly);
          return;
        }

        // Use Logic.Common.convertToMoney to format display
        // convertToMoney expects a number/string; pass numericOnly
        const formatted = Logic?.Common?.convertToMoney
          ? Logic.Common.convertToMoney(numericOnly, false, "")
          : numericOnly;
        setContentAndPositionCursor(formatted);
      } else {
        setContentAndPositionCursor(innerText);
      }
    };

    const isNumber = (evt: any) => {
      if (
        inputmode.value != "tel" &&
        inputmode.value != "numeric" &&
        inputmode.value != "decimal"
      )
        return true;

      evt = evt ? evt : window.event;
      const charCode = evt.which ? evt.which : evt.keyCode;

      if (
        charCode > 31 &&
        (charCode < 48 || charCode > 57) &&
        charCode !== 46
      ) {
        evt.preventDefault();
      } else if (charCode === 46) {
        const value = evt.target.innerText || evt.target.value || "";
        if (value.includes(".")) {
          evt.preventDefault();
        } else {
          return true;
        }
      } else {
        return true;
      }
    };

    const setInputAttributes = () => {
      const metadata = lastAIMessageRef.value?.metadata
        ? JSON.parse(lastAIMessageRef.value?.metadata)
        : {};
      const extraInfo = metadata?.extras || {};

      if (extraInfo) {
        if (isSeller.value) {
          inputmode.value = "text";
        } else if (extraInfo?.input_type) {
          inputmode.value = extraInfo.input_type as InputMode;
        } else {
          inputmode.value = "text";
        }

        if (isSeller.value) {
          placeholder.value = "Type your message...";
        } else if (extraInfo?.input_placeholder) {
          placeholder.value = extraInfo.input_placeholder;
        } else {
          placeholder.value = "Enter message here";
        }
      } else {
        if (isSeller.value) {
          placeholder.value = "Type your message...";
        } else {
          placeholder.value = "Enter message here";
        }
      }
    };

    const setInputState = () => {
      showUSDAmount.value = false;

      if (props.disabled) {
        chatEnabled.value = false;
        placeholder.value = "Chat disabled";
        return;
      }

      if (isSeller.value) {
        chatEnabled.value = true;
        placeholder.value = "Type your message...";
        return;
      }

      if (props.orderConfirmed) {
        chatEnabled.value = true;
        placeholder.value = "Type your message...";
        return;
      }

      if (lastAIMessageRef?.value?.metadata) {
        const metadata = JSON.parse(lastAIMessageRef.value.metadata);
        if (metadata.type == "options" && !isSeller.value) {
          chatEnabled.value = false;
          placeholder.value = "Choose an option";
        } else {
          if (metadata?.extras?.show_usd_amount) {
            showUSDAmount.value = true;
            minimumUSDAmount.value = metadata.extras.minimum_usd_amount || 2;
            const exchangeAd = Logic.Messaging.SingleConversation?.exchangeAd;
            localExchangeRate.value = exchangeAd?.rate || 10;
          } else {
            showUSDAmount.value = false;
          }
          chatEnabled.value = true;
          if (!isSeller.value) {
            placeholder.value =
              metadata?.extras?.input_placeholder || "Enter message here";
          }
        }
      } else {
        chatEnabled.value = true;
        if (!isSeller.value) {
          placeholder.value = "Enter message here";
        }
      }
    };

    const sendMessageInner = () => {
      if (props.disabled || !chatEnabled.value) {
        return;
      }

      if (props.showAddressMode) {
        return;
      }

      if (chatContent.value.trim() === "") {
        return;
      }

      if (showUSDAmount.value && !USDAmountIsValid.value) {
        return;
      }

      // If formatted, remove commas before sending so the value is numeric
      let toSend = chatContent.value;
      if (isFormatted.value && typeof toSend === "string") {
        toSend = toSend.replace(/,/g, "");
      }

      const canSend = props.sendMessage(toSend);
      if (canSend) {
        chatContent.value = "";
        const messageBox = document.getElementById("messageContainerInput");

        if (messageBox) {
          messageBox.innerHTML = "";
          messageBox.focus();
        }
      }
    };

    const handleKeyEvent = (e: any) => {
      if (props.showAddressMode) {
        e.preventDefault();
        return;
      }

      if (isSeller.value) {
        if (e.key === "Enter" || e.keyCode === 13) {
          if (!e.shiftKey) {
            sendMessageInner();
            e.preventDefault();
          }
        }
        return;
      }

      isNumber(e);
      if (e.keyCode == 13 && e.shiftKey) {
        return;
      }
      if (e.key === "Enter" || e.keyCode === 13) {
        sendMessageInner();
        e.preventDefault();
        return;
      }
    };

    const amountInUSD = computed(() => {
      if (!showUSDAmount.value) {
        return 0;
      }

      const content = chatContent.value || "0";
      const numericContent = parseFloat(content.replace(/[^0-9.]/g, "") || "0");

      if (localExchangeRate.value > 0) {
        return numericContent / localExchangeRate.value;
      } else {
        return numericContent;
      }
    });

    const USDAmountIsValid = computed(() => {
      if (!showUSDAmount.value) {
        return true;
      }

      return amountInUSD.value >= minimumUSDAmount.value;
    });

    watch(lastAIMessageRef, () => {
      setInputAttributes();
      setInputState();
    });

    watch(
      () => props.disabled,
      () => {
        setInputState();
      }
    );

    watch(
      () => props.orderConfirmed,
      () => {
        setInputState();
      }
    );

    watch(
      () => props.conversation,
      () => {
        setInputState();
      },
      { deep: true }
    );

    onMounted(() => {
      setInputAttributes();
      setInputState();
    });

    return {
      chatContent,
      chatEnabled,
      placeholder,
      onInput,
      handleKeyEvent,
      inputmode,
      sendMessageInner,
      lastAIMessageRef,
      editable,
      isSeller,
      showProofUpload,
      openProofUpload,
      isFormatted,
      showUSDAmount,
      minimumUSDAmount,
      localExchangeRate,
      amountInUSD,
      Logic,
      USDAmountIsValid,
    };
  },
});
</script>

<style scoped>
.textarea[contenteditable]:empty::before {
  content: attr(data-placeholder);
  color: #999999;
  pointer-events: none;
  display: block;
}
</style>
