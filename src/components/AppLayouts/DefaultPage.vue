<template>
  <div
    class="w-full h-full flex flex-col pb-4 lg:text-sm mdlg:text-[12px] text-xs font-poppins"
    :style="`
      padding-top: calc(env(safe-area-inset-top) + ${
        currentPlatform == 'android' ? '32' : '0'
      }px) !important;
      padding-bottom: calc(env(safe-area-inset-bottom) + 16px) !important;
    `"
  >
    <div class="w-full flex flex-col relative h-full overflow-y-auto">
      <!-- Top section -->
      <div
        class="w-full flex flex-col py-4 bg-white px-4 sticky top-0 z-[9999999999]"
      >
        <div class="w-full flex flex-row items-center justify-between">
          <app-image-loader
            :photo-url="photoUrl"
            custom-class="h-[40px] w-[40px] rounded-full"
            @click="Logic.Common.GoToRoute('/profile')"
          />

          <app-header-text class="!text-left">
            {{ title }}
          </app-header-text>

          <div
            @click="Logic.Common.GoToRoute('/notifications')"
            class="border border-black rounded-full h-9 w-9 flex justify-center items-center"
          >
            <app-icon name="bell" custom-class="h-6" />
          </div>
        </div>

        <slot name="extra-top-section" />
      </div>

      <!-- Content -->
      <slot />
    </div>
  </div>
</template>

<script lang="ts">
import { AppHeaderText } from "../AppTypography";
import AppImageLoader from "../AppImageLoader";
import AppIcon from "../AppIcon";
import { computed, defineComponent } from "vue";
import { Logic } from "../../composable";
import { getPlatforms } from "@ionic/vue";

export default defineComponent({
  components: {
    AppHeaderText,
    AppIcon,
    AppImageLoader,
  },
  props: {
    title: {
      type: String,
      default: "",
    },
    useTopPadding: {
      type: Boolean,
      default: false,
    },
    photoUrl: {
      type: String,
      default:
        Logic.Auth.AuthUser?.profile?.profile_picture ||
        "/images/profile-image.svg",
    },
  },
  name: "DefaultIndexLayout",
  setup() {
    const currentPlatform = computed(() => {
      return getPlatforms()[0];
    });

    return {
      Logic,
      currentPlatform,
    };
  },
});
</script>
