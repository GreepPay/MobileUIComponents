<template>
  <canvas ref="canvasRef" :id="uniqueId"></canvas>
</template>

<script lang="ts">
import { ref, onMounted, onBeforeUnmount, defineComponent } from "vue";

export default defineComponent({
  props: {
    folder: { type: String, required: true },
    totalFrames: { type: Number, default: 110 },
    targetFrameRate: { type: Number, default: 24 },
    downscale: { type: Boolean, default: true },
    preloadChunkSize: { type: Number, default: 10 }, // Load frames in chunks
    maxCacheSize: { type: Number, default: 30 }, // Limit memory usage
  },
  setup(props) {
    const canvasRef = ref<HTMLCanvasElement | null>(null);
    const frameCache = new Map<number, HTMLImageElement>();
    const loadingQueue = new Set<number>();
    const currentFrame = ref(1);
    const rafId = ref<number | null>(null);
    const isVisible = ref(true);
    const isLowEndDevice = ref(false);
    const uniqueId = Math.random().toString(36).substring(2, 15);
    const canvaDocument = ref();

    let actualFrameRate = props.targetFrameRate;
    let lastFrameTime = performance.now();
    let frameLoadPromise: Promise<void> | null = null;

    // Detect low-end device
    const detectDeviceCapability = () => {
      const canvas = document.createElement("canvas");
      const gl =
        canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
      const isWebView = /wv/.test(navigator.userAgent);
      const isOldAndroid = /Android [1-4]/.test(navigator.userAgent);
      const hasLowMemory =
        (navigator as any).deviceMemory && (navigator as any).deviceMemory < 4;
      const isSlowCPU =
        navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 2;

      isLowEndDevice.value =
        isWebView || isOldAndroid || hasLowMemory || isSlowCPU || !gl;

      // Adjust settings for low-end devices
      if (isLowEndDevice.value) {
        actualFrameRate = Math.min(2, props.targetFrameRate);
        props.maxCacheSize = Math.min(15, props.maxCacheSize);
      }
    };

    const imagePath = (index: number) =>
      `${props.folder}/final-${String(index).padStart(4, "0")}.png`;

    const getOptimalDimensions = (img: HTMLImageElement) => {
      const maxWidth = isLowEndDevice.value ? 800 : 1200;
      const deviceScale =
        props.downscale && (window.innerWidth < 800 || isLowEndDevice.value)
          ? 0.5
          : 1;

      let { naturalWidth: w, naturalHeight: h } = img;

      // Further reduce for low-end devices
      if (w > maxWidth) {
        const scale = maxWidth / w;
        w *= scale;
        h *= scale;
      }

      return {
        width: Math.floor(w * deviceScale),
        height: Math.floor(h * deviceScale),
      };
    };

    const createOptimizedImage = (img: HTMLImageElement) => {
      const { width, height } = getOptimalDimensions(img);

      if (width === img.naturalWidth && height === img.naturalHeight) {
        return img; // No resize needed
      }

      // Use OffscreenCanvas if available (better performance)
      if (typeof OffscreenCanvas !== "undefined" && !isLowEndDevice.value) {
        const offscreen = new OffscreenCanvas(width, height);
        const ctx = offscreen.getContext("2d")!;
        ctx.imageSmoothingEnabled = false; // Faster rendering
        ctx.drawImage(img, 0, 0, width, height);

        const resized = new Image();
        offscreen
          .convertToBlob({ type: "image/webp", quality: 0.6 })
          .then((blob) => {
            resized.src = URL.createObjectURL(blob);
          });
        return resized;
      } else {
        // Fallback for older browsers/devices
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d")!;
        ctx.imageSmoothingEnabled = false;
        ctx.drawImage(img, 0, 0, width, height);

        const resized = new Image();
        resized.src = canvas.toDataURL("image/webp", 0.6);
        return resized;
      }
    };

    // Manage cache size to prevent memory issues
    const manageCacheSize = () => {
      if (frameCache.size > props.maxCacheSize) {
        const framesToRemove = frameCache.size - props.maxCacheSize;
        const currentFrameNum = currentFrame.value;

        // Remove frames furthest from current frame
        const sortedFrames = Array.from(frameCache.keys()).sort((a, b) => {
          const distanceA = Math.min(
            Math.abs(a - currentFrameNum),
            Math.abs(a - currentFrameNum + props.totalFrames),
            Math.abs(a - currentFrameNum - props.totalFrames)
          );
          const distanceB = Math.min(
            Math.abs(b - currentFrameNum),
            Math.abs(b - currentFrameNum + props.totalFrames),
            Math.abs(b - currentFrameNum - props.totalFrames)
          );
          return distanceB - distanceA;
        });

        for (let i = 0; i < framesToRemove; i++) {
          frameCache.delete(sortedFrames[i]);
        }
      }
    };

    // Load frames in chunks around current frame
    const loadFrameChunk = async (centerFrame: number) => {
      if (frameLoadPromise) return frameLoadPromise;

      const framesToLoad: number[] = [];
      const halfChunk = Math.floor(props.preloadChunkSize / 2);

      for (let i = -halfChunk; i <= halfChunk; i++) {
        let frameNum = centerFrame + i;
        if (frameNum < 1) frameNum += props.totalFrames;
        if (frameNum > props.totalFrames) frameNum -= props.totalFrames;

        if (!frameCache.has(frameNum) && !loadingQueue.has(frameNum)) {
          framesToLoad.push(frameNum);
          loadingQueue.add(frameNum);
        }
      }

      if (framesToLoad.length === 0) return Promise.resolve();

      frameLoadPromise = Promise.all(
        framesToLoad.map(
          (frameNum) =>
            new Promise<void>((resolve) => {
              const img = new Image();
              img.crossOrigin = "anonymous"; // Prevent CORS issues
              img.src = imagePath(frameNum);

              const timeoutId = setTimeout(() => {
                loadingQueue.delete(frameNum);
                resolve();
              }, 3000); // 3s timeout

              img.onload = () => {
                clearTimeout(timeoutId);
                try {
                  frameCache.set(frameNum, createOptimizedImage(img));
                  manageCacheSize();
                } catch (e) {
                  console.warn(`Failed to process frame ${frameNum}:`, e);
                }
                loadingQueue.delete(frameNum);
                resolve();
              };

              img.onerror = () => {
                clearTimeout(timeoutId);
                loadingQueue.delete(frameNum);
                resolve();
              };
            })
        )
      ).then(() => {
        frameLoadPromise = null;
      });

      return frameLoadPromise;
    };

    const drawFrame = (frame: number) => {
      const canvas = canvasRef.value;
      if (!canvas) return;

      const ctx = canvas.getContext("2d")!;
      const img = frameCache.get(frame);

      if (!img) {
        // Load frame if not cached
        loadFrameChunk(frame);
        return;
      }

      // Only resize canvas if dimensions changed
      if (
        canvas.width !== img.naturalWidth ||
        canvas.height !== img.naturalHeight
      ) {
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
    };

    const loop = (time: number) => {
      if (!isVisible.value) return;

      const delta = time - lastFrameTime;
      const targetFrameDuration = 2000 / actualFrameRate;

      if (delta >= targetFrameDuration) {
        drawFrame(currentFrame.value);

        // Preload next chunk if needed
        const nextChunkCenter = currentFrame.value + props.preloadChunkSize;
        if (nextChunkCenter <= props.totalFrames) {
          loadFrameChunk(nextChunkCenter);
        }

        currentFrame.value = (currentFrame.value % props.totalFrames) + 1;
        lastFrameTime = time;

        // More aggressive frame rate adaptation for low-end devices
        const performanceThreshold = isLowEndDevice.value ? 1.2 : 1.5;
        // const minFrameRate = isLowEndDevice.value ? 12 : 12;

        const minFrameRate = 2;

        if (
          delta > targetFrameDuration * performanceThreshold &&
          actualFrameRate > minFrameRate
        ) {
          actualFrameRate = Math.max(
            minFrameRate,
            actualFrameRate - (isLowEndDevice.value ? 3 : 2)
          );
        } else if (
          delta < targetFrameDuration * 0.8 &&
          actualFrameRate < props.targetFrameRate
        ) {
          actualFrameRate = Math.min(
            props.targetFrameRate,
            actualFrameRate + 1
          );
        }
      }

      rafId.value = requestAnimationFrame(loop);
    };

    const startLoop = () => {
      stopLoop();
      lastFrameTime = performance.now();
      rafId.value = requestAnimationFrame(loop);
    };

    const stopLoop = () => {
      if (rafId.value) {
        cancelAnimationFrame(rafId.value);
        rafId.value = null;
      }
    };

    const handleVisibilityChange = (event: any) => {
      isVisible.value = !canvaDocument.value?.hidden;
      console.log(`Visibility changed: ${isVisible.value}`, event);
      if (isVisible.value) {
        startLoop();
      } else {
        stopLoop();
      }
    };

    const setupIntersectionObserver = () => {
      const observer = new IntersectionObserver(
        (entries) => {
          const isIntersecting = entries[0].isIntersecting;
          isVisible.value = isIntersecting;

          if (isIntersecting) {
            startLoop();
            // Start loading frames when component becomes visible
            loadFrameChunk(currentFrame.value);
          } else {
            stopLoop();
          }
        },
        {
          threshold: isLowEndDevice.value ? 0.05 : 0.1,
          rootMargin: "50px", // Start loading before fully visible
        }
      );

      if (canvasRef.value) {
        observer.observe(canvasRef.value);
      }

      return observer;
    };

    let observer: IntersectionObserver | null = null;

    // Register cleanup before any async operations
    onBeforeUnmount(() => {
      stopLoop();
      frameCache.clear();
      loadingQueue.clear();
      canvaDocument.value?.removeEventListener(
        "visibilitychange",
        handleVisibilityChange
      );
      observer?.disconnect();
    });

    onMounted(() => {
      const isLoader = props.folder == "/images/logo";

      const initiaite = async () => {
        canvaDocument.value = document.getElementById(uniqueId);
        if (canvaDocument.value) {
          detectDeviceCapability();

          observer = setupIntersectionObserver();
          canvaDocument.value.addEventListener(
            "visibilitychange",
            handleVisibilityChange
          );

          // Start with initial frame load
          await loadFrameChunk(1);
          startLoop();
          console.log(
            `AppImageSequence component mounted with ID: ${uniqueId}`
          );
        } else {
          console.error("Canvas element not found during mount.");
        }
      };

      if (isLoader) {
        initiaite();
      } else {
        setTimeout(async () => {
          initiaite();
        }, 500);
      }
    });

    return { canvasRef, uniqueId };
  },
});
</script>
