<template>
  <Teleport to="body">
 <Transition name="slide">
    <div
      v-if="isVisible"
      :class="`w-full flex flex-col items-center justify-center top-0 left-0  fixed !z-[999999999999999999] `"
    >
      <div
        :class="`flex flex-col space-y-2 w-full px-4  cursor-pointer  items-center justify-center mdlg:!border-l-[1px] mdlg:!border-r-[1px] mdlg:!border-gray-500 `"
        style="padding-top: calc(env(safe-area-inset-top) + 16px)"
      >
        <div :class="alertClasses">
          <app-icon :name="`alert-${setup.type}`" custom-class="!h-7 mt-0.5" />

          <!-- Message container -->
          <div class="flex-1 px-2">
            <app-header-text class="!text-sm">
              {{ alertTitle }}
            </app-header-text>
            <app-normal-text class="!font-normal !flex-wrap">
              {{ capitalize(setup.message) }}
            </app-normal-text>

            <!-- Action -->
            <div class="mt-1" v-if="setup.action">
              <app-normal-text
                @click="setup.action?.handler"
                :class="actionTextClasses"
              >
                {{ setup.action.text }}
              </app-normal-text>
            </div>
          </div>

          <!-- close icon -->
          <app-icon name="close" custom-class="!h-6" @click="close" />
        </div>
      </div>
    </div>
  </Transition>
  </Teleport>
 
</template>
<script lang="ts">
  import { defineComponent, onMounted, ref, computed, capitalize } from "vue"
  import AppIcon from "../AppIcon"
  import { AppNormalText, AppHeaderText } from "../AppTypography"

  export default defineComponent({
    components: {
      AppNormalText,
      AppHeaderText,
      AppIcon,
    },
    props: {
      setup: {
        type: Object as () => {
          show: boolean
          message: string
          type: "success" | "error" | "info"
          action?: {
            text: string
            handler: () => void
          }
        },
        default: () => ({
          show: true,
          message: "Hello alert",
          type: "success",
        }),
      },
    },
    setup(props) {
      const isVisible = ref(true)

      const close = () => {
        isVisible.value = false
      }

      const alertClasses = computed(() => {
        const base =
          "!w-full border-[2px] rounded-[12px] p-3 justify-between items-start flex !bg-white"
        const typeClasses = {
          success: "!border-green bg-light-green",
          error: "!border-red bg-light-red",
          info: "!border-blue bg-light-blue",
        }
        return `${base} ${typeClasses[props.setup.type] || ""}`
      })

      const actionTextClasses = computed(() => {
        const colorClasses = {
          success: "!text-green",
          error: "!text-red",
          info: "!text-blue",
        }
        return `!w-fit !text-sm !font-medium ${
          colorClasses[props.setup.type] || ""
        }`
      })

      const alertTitle = computed(() => {
        const type = props.setup.type
        const titlePrefix =
          type === "success"
            ? "Successful"
            : type.charAt(0).toUpperCase() + type.slice(1)
        return `${titlePrefix} message`
      })

      onMounted(() => {
        isVisible.value = true
        setTimeout(() => (isVisible.value = false), 10000)
      })

      return {
        isVisible,
        alertClasses,
        actionTextClasses,
        alertTitle,
        close,
        capitalize
      }
    },
  })
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
