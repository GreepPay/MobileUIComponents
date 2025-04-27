<template>
  <component :is="Teleport" to="body">
    <transition name="fade" appear>
      <div
        :class="`fixed top-0 w-screen h-screen bg-black/30 flex flex-col overflow-y-hidden items-center mdlg:justify-center! justify-end ${customClass}`"
        style="z-index: 9999999999999999"
        @click="closeModal()"
      >
        <div
          class="w-full bg-white rounded-t-[20px] min-h-[100px] relative"
          @click.stop="null"
        >
          <div
            class="px-4 py-4 flex items-center gap-4 border-b-[4px] w-full"
            v-if="hasTitle"
          >
            <app-header-text customClass="!flex-1 !text-lg">
              {{ title }}
            </app-header-text>

            <app-icon name="close-circle" @click="closeModal()" />
          </div>

          <div :class="`py-4 px-4 ${contentClass}`">
            <slot />
          </div>
        </div>
      </div>
    </transition>
  </component>
</template>
<script lang="ts">
  import { Teleport as teleport_, TeleportProps, VNodeProps } from "vue"

  const Teleport = teleport_ as {
    new (): {
      $props: VNodeProps & TeleportProps
    }
  }

  import { AppHeaderText } from "../AppTypography"
  import AppIcon from "../AppIcon"

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
          props.close()
        }
      }

      return {
        closeModal,
        Teleport,
      }
    },
  }
</script>
