<template>
  <div class="w-full flex flex-col sticky top-0 left-0 pt-4 bg-white z-5">
    <!-- Top bar -->
    <div
      class="w-full flex flex-row items-center justify-between border-b-[1.5px] border-[#F0F3F6] px-4 pb-4"
    >
      <div class="flex flex-row items-center">
        <div class="w-[24px] mr-2" @click="handleBackClick">
          <app-icon name="arrow-left" custom-class="!h-[24px]" />
        </div>
        <div class="w-[50px] mr-2">
          <app-avatar :src="topBarInfo.photo_url" :size="48" />
        </div>
        <div class="flex flex-col">
          <app-normal-text
            class="!text-sm px-2"
            is-html
            :html-content="topBarInfo.title"
          >
          </app-normal-text>

          <div class="flex flex-row items-center">
            <app-normal-text
              v-if="topBarInfo.partitipants"
              class="!text-xs px-2 !text-gray-500 !line-clamp-1"
            >
              {{ topBarInfo.partitipants.join(", ") }}
            </app-normal-text>
          </div>
        </div>
      </div>

      <div class="w-[24px]" @click="handleInfoClick">
        <app-icon name="info-circle" custom-class="!h-[24px]" />
      </div>
    </div>

    <!-- Alerts -->
    <template v-for="(item, index) in topBarInfo.alerts" :key="index">
      <div
        class="w-full flex flex-row items-center justify-between border-b-[1.5px] border-[#F0F3F6] px-4 py-4"
      >
        <div class="flex flex-row items-center">
          <div class="!w-[35px]">
            <div class="!w-[35px]">
              <app-icon :name="`${item.type}-alert`" custom-class="!h-[35px]" />
            </div>
          </div>

          <div class="flex flex-row">
            <app-normal-text class="px-3 !text-gray-500">
              {{ item.content }}
            </app-normal-text>
          </div>
        </div>

        <div class="w-[25px]" @click="dismissAlert(index)">
          <app-icon name="close" class="!h-[25px]" />
        </div>
      </div>
    </template>
  </div>
</template>

<script lang="ts">
import { defineComponent, onMounted, watch, reactive } from "vue";
import AppAvatar from "../AppAvatar/index.vue";
import AppNormalText from "../AppTypography/AppNormalText.vue";
import AppIcon from "../AppIcon/index.vue";

interface TopBarInfo {
  title: string;
  photo_url: string;
  partitipants?: string[];
  alerts: {
    type: "info" | "success" | "danger";
    content: string;
  }[];
}

export default defineComponent({
  name: "ChatTopBar",
  components: {
    AppAvatar,
    AppNormalText,
    AppIcon,
  },
  props: {
    conversation: {
      type: Object,
      default: () => ({}),
    },
  },
  emits: ['back-click', 'info-click', 'dismiss-alert'],
  setup(props, { emit }) {
    const topBarInfo = reactive<TopBarInfo>({
      title: "P2P Trade",
      photo_url: "/images/chat-logo.png",
      partitipants: [],
      alerts: [],
    });

    const handleBackClick = () => {
      emit('back-click');
    };

    const handleInfoClick = () => {
      emit('info-click');
    };

    const dismissAlert = (index: number) => {
      topBarInfo.alerts.splice(index, 1);
      emit('dismiss-alert', index);
    };

    const setContent = () => {
      if (props.conversation) {
        // Check if this is a P2P trade conversation
        if (props.conversation.entity_type === 'p2p_withdrawal') {
          // Get the business participant if available
          const participants = props.conversation.participants;
          const businessParticipant = participants?.find((p: any) => 
            p.user && p.user.uuid !== props.conversation?.created_by?.uuid
          );
          
          if (businessParticipant?.user) {
            const businessName = `${businessParticipant.user.first_name} ${businessParticipant.user.last_name}`.trim();
            topBarInfo.title = `P2P Trade with <span class='font-semibold'>${businessName}</span>`;
          } else {
            topBarInfo.title = props.conversation.name || "P2P Trade";
          }
        } else {
          topBarInfo.title = props.conversation.name || "Chat";
        }
        
        topBarInfo.photo_url = "/images/chat-logo.png";
        topBarInfo.alerts = [];

        const participants = props.conversation.participants;
        if (participants && participants.length > 0) {
          topBarInfo.partitipants = participants.map((participant: any) => { 
            if (participant.user) {
              return participant.user.first_name + " " + participant.user.last_name;
            } else {
              return "Greep AI";
            }
          });
        }
      }
    };

    onMounted(() => {
      setContent();
    });

    // Watch for conversation changes to update the top bar
    watch(() => props.conversation, () => {
      setContent();
    }, { deep: true });

    // Watch for participant changes specifically
    watch(() => props.conversation?.participants, () => {
      setContent();
    }, { deep: true });

    return {
      topBarInfo,
      handleBackClick,
      handleInfoClick,
      dismissAlert,
    };
  },
});
</script>