<template>
  <Teleport to="body">
 <Transition name="slide">
    <div
      v-if="isVisible"
      :class="`w-full flex flex-col items-center justify-center top-0 left-0  fixed !z-[999999999999999999] `"
    >
      <div
        :class="`flex flex-col space-y-2 w-full px-4  cursor-pointer   items-center justify-center mdlg:!border-l-[1px] mdlg:!border-r-[1px] mdlg:!border-gray-500 `"
        :style="`padding-top: calc(env(safe-area-inset-top) + ${
          currentPlatform == 'android' ? '45' : '16'
        }px)`"
        @click="close"
      >
        <div
          :class="`!w-full border-[2px] bg-white px-2 ${
            setup.type === 'success' ? '!border-green' : ''
          }  ${setup.type === 'error' ? '!border-red' : ''}  ${
            setup.type === 'info' ? '!border-purple' : ''
          } rounded-[30px]  py-1 justify-between items-center flex flex-row `"
        >
          <div class="flex flex-row items-center">
            <AppIcon :name="`alert-${setup.type}`" custom-class="!h-[35px]" />
            <app-normal-text class="!font-[500] !line-clamp-1 pl-2 pr-2">
              {{ setup.message }}
            </app-normal-text>
          </div>

          <div class="flex flex-row justify-end" v-if="setup.action">
            <span
              @click="setup.action?.handler"
              class="px-3 py-[2px] bg-grey-50 rounded-[30px]"
            >
              <app-normal-text class="!text-purple-400">
                {{ setup.action.text }}
              </app-normal-text>
            </span>
          </div>
        </div>
      </div>
    </div>
  </Transition>
  </Teleport>
 
</template>
<script lang="ts">
import { computed, defineComponent, onMounted, ref } from "vue";
import AppIcon from "../AppIcon";
import { AppNormalText } from "../AppTypography";
import { getPlatforms } from "@ionic/vue";

export default defineComponent({
  components: {
    AppNormalText,
    AppIcon,
  },
  props: {
    setup: {
      type: Object as () => {
        show: boolean;
        message: string;
        type: "success" | "error" | "info";
        action?: {
          text: string;
          handler: () => void;
        };
      },
      default: () => ({
        show: true,
        message: "Hello alert",
        type: "success",
      }),
    },
  },
  setup() {
    const isVisible = ref(true);

    const close = () => {
      isVisible.value = false;
    };

    const currentPlatform = computed(() => {
      return getPlatforms()[0];
    });

    onMounted(() => {
      isVisible.value = true;
      // setTimeout(() => {
      //   isVisible.value = false;
      // }, 5000);
    });

    return {
      isVisible,
      close,
      currentPlatform,
    };
  },
});
</script>

<style scoped>
.slide-enter-active,
.slide-leave-active {
  transition: all 0.5s ease;
}

.slide-enter-from,
.slide-leave-to {
  transform: translateY(-100%);
  opacity: 0;
}

.slide-enter-to,
.slide-leave-from {
  transform: translateY(0);
  opacity: 1;
}
</style>
