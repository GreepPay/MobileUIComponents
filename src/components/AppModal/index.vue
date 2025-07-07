<template>
  <component :is="Teleport" to="body">
    <transition name="fade" appear>
      <div
        :class="`fixed top-0 w-screen  bg-black/30 flex flex-col overflow-y-hidden items-center mdlg:justify-center! justify-end ${customClass}`"
        :style="`height: ${mobileFullHeight ? mobileFullHeight.height : ''
          }; z-index: 9999999999999999;`" @click="canClose ? closeModal() : null">
        <div :class="`w-full bg-white rounded-t-[20px] p-4 pb-0 min-h-[100px] relative max-h-[60%] ${innerClass}`"
          @click.stop="null">
          <div class="p-4 flex items-center gap-4 border-b-[4px] w-full sticky top-0 bg-white" :class="titleClass"
            v-if="hasTitle">
            <div class="!flex-1 flex items-center">
              <app-icon v-if="hasBackButton" name="arrow-left" @click.stop="closeModal()" enter-class="flex" />

              <span :class="[
                '!text-lg !flex-1 text-black font-semibold',
                hasBackButton && '!text-center',
              ]">
                {{ title }}
              </span>
            </div>

            <app-icon name="close-circle" @click.stop="closeModal(true)" custom-class="h-[24px]" />
          </div>

          <div :class="`px-4 py-4 ${contentClass}`">
            <slot />
          </div>

          <slot name="bottom-section" class="absolute !bottom-0 w-full border-t" />
        </div>
      </div>
    </transition>
  </component>
</template>
<script lang="ts">
import {
  computed,
  defineComponent,
  onMounted,
  onUnmounted,
  ref,
  Teleport as teleport_,
  TeleportProps,
  VNodeProps,
} from "vue"

const Teleport = teleport_ as {
  new(): {
    $props: VNodeProps & TeleportProps
  }
}

import { AppHeaderText } from "../AppTypography"
import AppIcon from "../AppIcon"

/**
 *  Modal component that displays content in an overlay.
 */
export default defineComponent({
  name: "AppModal",
  components: {
    AppHeaderText,
    AppIcon,
  },
  props: {
    /**
     * Determines whether the modal can be closed by clicking outside or pressing the close icon.
     */
    canClose: {
      type: Boolean,
      default: true,
    },
    hasBackButton: {
      type: Boolean,
      default: false,
    },
    /**
     * Title of the modal, displayed in the header.
     */
    title: {
      type: String,
      default: "",
    },
      /**
       * Function to execute when the modal is closed.
       * @required
       */ close: {
      type: Function,
      required: true,
    },
    /**
     * @required
     */
    hasTitle: {
      type: Boolean,
      required: false,
    },
    /**
     * Custom CSS classes to apply to the modal container.
     */
    customClass: {
      type: String,
      default: "",
    },
    contentClass: {
      type: String,
      default: "",
    },
    titleClass: {
      type: String,
      default: "",
    },
    /**
     * Custom CSS classes to apply to the inner modal container.
     */
    innerClass: {
      type: String,
      default: "",
    },
  },
  setup(props) {
    const closeModal = (fromButton = false) => {
      if (props.canClose || fromButton) {
        props.close()
      }
    }

    const innerHeight = ref(window.innerHeight)

    const updateHeight = () => {
      innerHeight.value = window.innerHeight
    }

    onMounted(() => {
      updateHeight()
      window.addEventListener("resize", updateHeight)
    })

    onUnmounted(() => {
      window.removeEventListener("resize", updateHeight)
    })

    const mobileFullHeight = computed(() => {
      return {
        height: `${innerHeight.value}px`,
      }
    })

    return {
      closeModal,
      Teleport,
      mobileFullHeight,
    }
  },
})
</script>
