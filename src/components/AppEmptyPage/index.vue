<template>
  <div
    class="w-full flex flex-col min-h-screen overflow-hidden px-4 justify-center items-center"
  >
    <app-icon :name="icon" custom-class="!h-[60px]" v-if="useIcon" />

    <div class="flex flex-col items-center justify-center px-5 pt-3">
      <app-header-text class="!text-[#0A141E]">
        {{ title }}
      </app-header-text>
      <app-normal-text
        class="!text-[#616161] !text-base !text-center pt-[4px] px-4 leading-5"
      >
        {{ description }}
      </app-normal-text>
    </div>

    <div class="w-full flex flex-row justify-center items-center pt-4">
      <app-button
        variant="secondary"
        class="!px-6 py-4"
        @click="handleButtonClick"
      >
        {{ buttonLabel }}
      </app-button>
    </div>
  </div>
</template>

<script lang="ts">
  import { defineComponent } from "vue"
  import AppIcon from "../AppIcon"
  import { AppNormalText, AppHeaderText } from "../AppTypography"
  import AppButton from "../AppButton"
  import { Logic } from "@greep/logic"

  /**
   * AppEmptyState Component
   *
   * Shows an empty state with an icon, title, and description
   */
  export default defineComponent({
    name: "AppEmptyPage",
    components: {
      AppIcon,
      AppNormalText,
      AppButton,
      AppHeaderText,
    },
    props: {
      useIcon: {
        type: Boolean,
        default: true,
      },
      icon: {
        type: String,
        default: "info-circle-gray",
      },
      title: {
        type: String,
        default: "Nothing here yet",
      },
      description: {
        type: String,
        default:
          "Go get things done, there’s plenty waiting for you. Explore market, shops, food, products, events, and more—personalized just for you.",
      },
      buttonLabel: {
        type: String,
        default: "Home",
      },
      btnToAnotherRoute: {
        type: Boolean,
        default: false,
      },
    },
    setup(props, { emit }) {
      const handleButtonClick = () => {
        console.log("btn-click")
        if (props.btnToAnotherRoute) {
          emit("btn-click")
        } else {
          Logic.Common.GoToRoute("/")
        }
      }
      return { handleButtonClick }
    },
  })
</script>
