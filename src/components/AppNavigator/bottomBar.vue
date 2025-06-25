<template>
  <div
    class="flex flex-col items-center pt-0 z-[400] w-full justify-center !font-inter fixed left-0 bottom-0 mdlg:!hidden md:!hidden !bg-white"
    :style="`
        padding-bottom: calc(env(safe-area-inset-bottom) + ${
          currentPlatform == 'android' ? '16' : '12'
        }px) !important;`"
  >
    <div :class="`w-full  flex flex-row items-center justify-between `">
      <router-link
        v-for="(tab, index) in tabs"
        :key="index"
        :to="tab.path"
        :class="`flex flex-col space-y-[2px] pt-3 items-center justify-center ${
          tabIsActive(tab.routeTag)
            ? 'border-t-[3px] border-primary'
            : 'border-t-[3px] border-[#F0F3F6]'
        } `"
        :style="`width: ${100 / tabs.length}% ;`"
      >
        <app-icon
          :name="
            hoverTab == tab.icon || tabIsActive(tab.routeTag)
              ? `bottom-bar/${tab.icon}-active`
              : `bottom-bar/${tab.icon}`
          "
          :custom-class="`!h-[20px]`"
        />

        <app-normal-text
          :color="` !text-[11px] ${
            tabIsActive(tab.routeTag) ? '!text-primary' : '!text-[#999999]'
          } `"
          :customClass="`${tabIsActive(tab.routeTag) ? '!font-[500]' : ''}`"
        >
          {{ tab.name }}</app-normal-text
        >
      </router-link>
    </div>
  </div>
</template>
<script lang="ts">
import AppIcon from "../AppIcon";
import { AppNormalText } from "../AppTypography";
import { computed, ref } from "vue";
import { Logic } from "../../composable";
import { getPlatforms } from "@ionic/vue";

export default {
  components: {
    AppIcon,
    AppNormalText,
  },
  props: {
    tabIsActive: {
      type: Function,
      required: true,
    },
    options: {
      required: false,
    },
    accountType: {
      type: String,
      default: "",
    },
    spaceBetween: {
      type: Boolean,
      default: false,
    },
    tabs: {
      type: Array as () => {
        icon: string;
        name: string;
        path: string;
        routeTag: string;
      }[],
    },
  },
  name: "AppBottomBar",
  setup() {
    const hoverTab = ref("");

    const currentPlatform = computed(() => {
      return getPlatforms()[0];
    });

    return {
      hoverTab,
      Logic,
      currentPlatform,
    };
  },
};
</script>
