<template>
  <component :is="Teleport" to="body">
    <transition name="fade" appear>
      <div
        :class="`fixed top-0 w-screen  bg-black/30 flex flex-col overflow-y-hidden items-center mdlg:justify-center! justify-end ${customClass}`"
        :style="`height: ${
          mobileFullHeight ? mobileFullHeight.height : ''
        }; z-index: 9999999999999999;`"
        @click="closeModal()"
      >
        <div
          class="w-full bg-white rounded-t-[20px] p-6 min-h-[100px] relative"
          @click.stop="null"
        >
          <!--
               * @slot -  Content to be displayed within the modal.
               -->
          <slot />
        </div>
      </div>
    </transition>
  </component>
</template>
<script lang="ts">
import {
  computed,
  onMounted,
  onUnmounted,
  ref,
  Teleport as teleport_,
  TeleportProps,
  VNodeProps,
} from "vue";

const Teleport = teleport_ as {
  new (): {
    $props: VNodeProps & TeleportProps;
  };
};

import { AppHeaderText } from "../AppTypography";
import AppIcon from "../AppIcon";

/**
 *  Modal component that displays content in an overlay.
 */
export default {
  components: {
    AppHeaderText,
    AppIcon,
  },
  name: "AppModal",
  props: {
    /**
     * Determines whether the modal can be closed by clicking outside or pressing the close icon.
     */
    canClose: {
      type: Boolean,
      default: true,
    },
    /**
     * Function to execute when the modal is closed.
     * @required
     */
    close: {
      type: Function,
      required: true,
    },
    /**
     * Custom CSS classes to apply to the modal container.
     */
    customClass: {
      type: String,
      default: "",
    },
    /**
     * Title of the modal, displayed in the header.
     */
    title: {
      type: String,
      default: "",
    },
  },
  setup(props: any) {
    const closeModal = () => {
      if (props.canClose) {
        props.close();
      }
    };

    const innerHeight = ref(window.innerHeight);

    const updateHeight = () => {
      innerHeight.value = window.innerHeight;
    };

    onMounted(() => {
      updateHeight();
      window.addEventListener("resize", updateHeight);
    });

    onUnmounted(() => {
      window.removeEventListener("resize", updateHeight);
    });

    const mobileFullHeight = computed(() => {
      return {
        height: `${innerHeight.value}px`,
      };
    });

    return {
      closeModal,
      Teleport,
      mobileFullHeight,
    };
  },
};
</script>
