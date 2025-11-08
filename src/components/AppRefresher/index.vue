<template>
  <div ref="root" class="app-refresher" :style="rootStyle">
    <div
      v-if="showLoading"
      class="w-full flex flex-col items-center justify-center pb-2"
      :style="{ height: `${indicatorHeight}px` }"
    >
      <app-loading class="!text-primary" />
    </div>

    <slot />
  </div>
</template>

<script lang="ts">
import {
  defineComponent,
  ref,
  onMounted,
  onBeforeUnmount,
  computed,
} from "vue";
import type { PropType } from "vue";
import AppLoading from "../AppLoading";

export default defineComponent({
  name: "AppRefresher",
  components: { AppLoading },
  props: {
    onRefresh: {
      type: Function as PropType<() => Promise<void> | void>,
      required: true,
    },
    threshold: {
      type: Number,
      default: 45,
    },
    indicatorHeight: {
      type: Number,
      default: 30,
    },
  },
  setup(props) {
    const root = ref<HTMLElement | null>(null);
    const startY = ref(0);
    const translateY = ref(0);
    const isPulling = ref(false);
    const isRefreshing = ref(false);
    const showLoading = ref(false);
    const transitionStyle = ref("none");
    let startedAtTop = false;
    let scrollContainer: (Element | (Element & { scrollTop?: number })) | null =
      null;

    function findScrollParent(el: Element | null): Element | null {
      let cur = el;
      while (cur && cur !== document.documentElement) {
        const style = window.getComputedStyle(cur);
        const overflowY = style.overflowY;
        const canScroll =
          (overflowY === "auto" ||
            overflowY === "scroll" ||
            overflowY === "overlay") &&
          cur.scrollHeight > cur.clientHeight;
        if (canScroll) return cur;
        cur = cur.parentElement;
      }
      return document.scrollingElement as Element | null;
    }

    function containerScrollTop(): number {
      if (!scrollContainer) return 0;
      if (
        scrollContainer === document.scrollingElement ||
        scrollContainer === document.documentElement
      ) {
        return (document.scrollingElement?.scrollTop ??
          window.scrollY) as number;
      }
      return (scrollContainer as Element).scrollTop ?? 0;
    }

    function onTouchStartRaw(e: TouchEvent) {
      // find container at touch start (in case layout changed)
      scrollContainer = findScrollParent(root.value);

      const top = containerScrollTop();
      if (top <= 0 && !isRefreshing.value) {
        startY.value = e.touches[0].clientY;
        startedAtTop = true;
        isPulling.value = true;
        transitionStyle.value = "none";
      } else {
        startedAtTop = false;
      }
    }

    function onTouchMoveRaw(e: TouchEvent) {
      if (!isPulling.value || !startedAtTop || isRefreshing.value) return;

      const topNow = containerScrollTop();
      // if the user scrolled the container away from top during the gesture, cancel
      if (topNow > 0) {
        cancelPull();
        return;
      }

      const currentY = e.touches[0].clientY;
      const diff = currentY - startY.value;

      // only consider downward movement
      if (diff <= 0) return;

      // allow preventing native bounce; listener is non-passive
      e.preventDefault();

      // add easing — divide by 2 and cap at twice the threshold for a natural feel
      translateY.value = Math.min(diff / 2, props.threshold * 2);
    }

    async function onTouchEndRaw() {
      if (!isPulling.value || !startedAtTop) return;

      isPulling.value = false;
      transitionStyle.value = "transform 0.25s ease";

      if (translateY.value >= props.threshold) {
        // trigger refresh
        isRefreshing.value = true;
        // show a fixed indicator height while refreshing
        translateY.value = props.indicatorHeight;

        try {
          // support both sync and async handlers
          showLoading.value = true;
          const result = props.onRefresh();
          if (result && typeof (result as Promise<void>).then === "function") {
            await result;
          }
          showLoading.value = false;
        } catch (err) {
          // swallow; user can handle errors inside their handler
        } finally {
          showLoading.value = false;
          // small delay so users see the loader for a short time
          setTimeout(() => {
            translateY.value = 0;
            // give the transform animation time to run before hiding loader
            setTimeout(() => {
              isRefreshing.value = false;
            }, 200);
          }, 200);
        }
      } else {
        // not far enough — reset
        translateY.value = 0;
      }

      startedAtTop = false;
    }

    function cancelPull() {
      isPulling.value = false;
      startedAtTop = false;
      transitionStyle.value = "transform 0.2s ease";
      translateY.value = 0;
    }

    const rootStyle = computed(() => ({
      transform: `translateY(${translateY.value}px)`,
      transition: transitionStyle.value,
      willChange: "transform",
      overflowY: "auto",
      touchAction: "pan-y",
    }));

    const registerListeners = () => {
      const el = root.value ?? document.body;
      el.addEventListener("touchstart", onTouchStartRaw, { passive: true });
      el.addEventListener("touchmove", onTouchMoveRaw, { passive: false });
      el.addEventListener("touchend", onTouchEndRaw, { passive: true });

      window.addEventListener("touchstart", onTouchStartRaw, { passive: true });
      window.addEventListener("touchmove", onTouchMoveRaw, { passive: false });
      window.addEventListener("touchend", onTouchEndRaw, { passive: true });
    };

    const removeListeners = () => {
      const el = root.value ?? document.body;
      el.removeEventListener("touchstart", onTouchStartRaw);
      el.removeEventListener("touchmove", onTouchMoveRaw);
      el.removeEventListener("touchend", onTouchEndRaw);

      window.removeEventListener("touchstart", onTouchStartRaw);
      window.removeEventListener("touchmove", onTouchMoveRaw);
      window.removeEventListener("touchend", onTouchEndRaw);
    };

    onMounted(() => {
      registerListeners();
    });

    onBeforeUnmount(() => {
      removeListeners();
    });

    return {
      root,
      isPulling,
      isRefreshing,
      rootStyle,
      indicatorHeight: props.indicatorHeight,
      showLoading,
      registerListeners,
      removeListeners,
    };
  },
});
</script>

<style scoped>
.app-refresher {
  -webkit-overflow-scrolling: touch;
}
</style>
