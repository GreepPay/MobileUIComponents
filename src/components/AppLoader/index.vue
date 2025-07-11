<template>
  <div
    v-if="setup"
    :class="`w-full flex flex-col fixed top-0 left-0  ${
      setup?.isInteractive
        ? 'bg-black !bg-opacity-60'
        : 'bg-black !bg-opacity-30 dark:!bg-opacity-50'
    }   z-[99999999999999999]`"
    :style="`padding-top: calc(env(safe-area-inset-top) + ${
      currentPlatform == 'android' ? '20' : '0'
    }px) !important;`"
    id="innerModal"
  >
    <template v-if="setup?.loading">
      <div :class="`loader-container w-full absolute top-0 left-0`">
        <div class="loader"></div>
      </div>
    </template>
  </div>
</template>
<script lang="ts">
import { Logic } from "../../composable";
import { defineComponent, onMounted, onUnmounted, ref } from "vue";
import AppIcon from "../AppIcon";
import { getPlatforms } from "@ionic/vue";
import { computed } from "vue";

export default defineComponent({
  components: {
    AppIcon,
  },
  props: {
    customClass: {
      type: String,
      required: false,
    },
    setup: {
      type: Object as () => {
        show?: boolean;
        loading?: boolean;
        message?: string;
        isInteractive?: boolean;
      },
    },
  },
  name: "AppLoader",
  setup(props) {
    const currentMessageIndex = ref(0);

    const timeoutTime = ref(120);
    const timeOutInstance = ref();
    const lottieContainer = ref();

    const messageInteval = ref();
    const messages = [""];

    const startTimeoutCounter = () => {
      timeOutInstance.value = setInterval(() => {
        if (timeoutTime.value == 0) {
          Logic.Common.hideLoader();
          Logic.Common.showAlert({
            show: true,
            message: "Network Timeout. Please try again",
            type: "error",
          });
          return;
        }
        timeoutTime.value -= 1;
      }, 1000);
    };

    const rotateMessage = () => {
      messageInteval.value = setInterval(() => {
        currentMessageIndex.value = Math.floor(Math.random() * messages.length);
      }, 5000);
    };

    const currentPlatform = computed(() => {
      return getPlatforms()[0];
    });

    onMounted(() => {
      if (props.setup?.isInteractive) {
        rotateMessage();
      }

      console.log(currentPlatform.value);

      startTimeoutCounter();
    });

    onUnmounted(() => {
      clearInterval(messageInteval.value);
      clearInterval(timeOutInstance.value);
    });

    return {
      messages,
      currentMessageIndex,
      lottieContainer,
      currentPlatform,
    };
  },
});
</script>
<style scoped>
.loader-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  height: 4px;
  background-color: transparent;
  border-radius: 4px;
  overflow: hidden;
}

.loader {
  height: 100%;
  animation: loaderAnimation 1.5s infinite;
}

@keyframes loaderAnimation {
  0% {
    width: 0%;
    background-color: #53c1ff;
  }
  25% {
    width: 25%;
    background-color: #ffaa00;
  }
  50% {
    width: 50%;
    background-color: #80d89b;
  }
  75% {
    width: 75%;
    background-color: #ea5959;
  }
  100% {
    width: 100%;
    background-color: #6a76e5;
  }
}

#innerModal {
  margin-top: env(safe-area-inset-top) !important;
  margin-bottom: env(safe-area-inset-bottom) !important;
  height: calc(
    100% - env(safe-area-inset-top) - env(safe-area-inset-bottom)
  ) !important;
}
</style>
