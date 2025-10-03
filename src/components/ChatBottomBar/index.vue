<template>
  <div
    :class="`w-full flex flex-col fixed bottom-0 left-0 py-4 !border-t-[1.5px] !border-[#F0F3F6] bg-white z-5 ${chatEnabled ? '' : '!opacity-[50%]'}`"
    :style="bottomPadding">
    <!-- Extra widget slot -->
    <slot name="extra-widget" />

    <!-- Proof upload section for sellers -->
    <div v-if="isSeller && showProofUpload" class="w-full px-4 mb-2">
      <div class="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-2">
            <span class="text-blue-600">📸</span>
            <span class="text-blue-800 text-sm font-medium">Upload proof of cash delivery</span>
          </div>
          <app-button
            variant="primary"
            :class="`px-5 !py-2 !border-[1.5px] !bg-transparent !border-purple-500 !text-purple-500`"
            @click="openProofUpload"
            >Upload</app-button
          >
        </div>
      </div>
    </div>

    <!-- Main input text area -->
    <div class="w-full flex flex-row px-4 items-center justify-between overflow-hidden max-w-full">
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
          :inputmode="inputmode">
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
          @click="showAddressMode ? $emit('click-address-input') : sendMessageInner"
          :class="`w-[56px] h-[56px] rounded-full ${showAddressMode ? 'bg-[#2563EB]' : chatEnabled ? 'bg-[#0A141E]' : 'bg-gray-300'} items-center justify-center flex flex-row ${chatEnabled ? 'cursor-pointer' : 'cursor-not-allowed'}`"
        >
          <div class="w-[24px]">
            <span v-if="showAddressMode" class="text-white text-lg">📍</span>
            <app-icon v-else name="send" :custom-class="`!h-[24px] ${chatEnabled ? 'text-white' : 'text-gray-500'}`" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, onMounted, toRef, watch, nextTick, ref } from "vue";
import AppIcon from "../AppIcon/index.vue";
import AppButton from "../AppButton/index.vue";

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
  },
  props: {
    conversation: {
      type: Object,
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
      default: '',
    },
  },
  emits: ['click-address-input', 'upload-proof'],
  setup(props, { emit }) {
    const editable = ref<HTMLElement | null>(null);
    const chatEnabled = ref(true);
    const placeholder = ref("Enter amount");
    const chatContent = ref("");
    const lastAIMessageRef = toRef(props, "lastAIMessage");
    const inputmode = ref<InputMode>("text");

    // Check if user is seller
    const isSeller = computed(() => {
      const participants = props.conversation?.participants || [];
      const currentUserId = props.authUser?.id;
      
      if (!currentUserId || !participants.length) {
        return false;
      }
      
      const currentUserIdNum = parseInt(currentUserId);
      
      // Check if current user is a participant
      const isParticipant = participants.some((p: any) => p.user_id === currentUserIdNum);
      
      // Check if current user is the owner (conversation creator)
      let isOwner = false;
      
      if (props.conversation?.owner_id) {
        isOwner = props.conversation.owner_id === currentUserIdNum;
      } else if (participants.length > 0) {
        const sortedParticipants = [...participants].sort((a: any, b: any) => a.id - b.id);
        isOwner = sortedParticipants[0].user_id === currentUserIdNum;
      }
      
      return isParticipant && !isOwner;
    });

    // Check if proof upload should be shown
    const showProofUpload = computed(() => {
      const stage = props.conversation?.stage || "";
      return (stage === "send_payment" || stage.includes("payment")) && !props.proofUploaded;
    });

    const openProofUpload = () => {
      emit('upload-proof');
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
      const innerText = event.target.innerText;
      setContentAndPositionCursor(innerText);
    };

    const isNumber = (evt: any) => {
      if (inputmode.value != "tel" && inputmode.value != "numeric" && inputmode.value != "decimal") return true;

      evt = evt ? evt : window.event;
      const charCode = evt.which ? evt.which : evt.keyCode;
      
      if (
        charCode > 31 &&
        (charCode < 48 || charCode > 57) &&
        charCode !== 46
      ) {
        evt.preventDefault();
      } else if (charCode === 46) {
        const value = evt.target.innerText || evt.target.value || '';
        if (value.includes('.')) {
          evt.preventDefault();
        } else {
          return true;
        }
      } else {
        return true;
      }
    };

    const setInputAttributes = () => {
      const metadata = lastAIMessageRef.value?.metadata ? JSON.parse(lastAIMessageRef.value?.metadata) : {};
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
          chatEnabled.value = true;
          if (!isSeller.value) {
            placeholder.value = "Enter message here";
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
      
      const canSend = props.sendMessage(chatContent.value);
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

    watch(lastAIMessageRef, () => {
      setInputAttributes();
      setInputState();
    });

    watch(() => props.disabled, () => {
      setInputState();
    });

    watch(() => props.orderConfirmed, () => {
      setInputState();
    });

    watch(() => props.conversation, () => {
      setInputState();
    }, { deep: true });

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