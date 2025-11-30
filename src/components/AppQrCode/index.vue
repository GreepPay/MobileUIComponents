<template>
  <div :id="uniqueId" class="!py-3"></div>
</template>

<script lang="ts">
import { defineComponent, onMounted } from "vue";
import QRCodeStyling from "qr-code-styling";

export default defineComponent({
  name: "AppQrCode",
  props: {
    data: {
      type: String,
      required: true,
    },
  },
  setup(props) {
    const uniqueId =
      Math.random().toString(36).substring(2, 15) +
      Math.random().toString(36).substring(2, 15);

    onMounted(async () => {
      try {
        setTimeout(() => {
          const canvas = document.getElementById(uniqueId);

          // Calculate parent container inner width
          const parentWidth = canvas?.parentElement?.clientWidth;
          const parentHeight = canvas?.parentElement?.clientHeight;
          if (canvas) {
            const qrCode = new QRCodeStyling({
              width: parentWidth,
              height: parentHeight,
              type: "svg",
              data: props.data.toString(),
            });
            qrCode.append(canvas);
          }
        }, 500);
      } catch (error) {
        console.error("Failed to load QR code library:", error);
      }
    });

    return {
      uniqueId,
    };
  },
});
</script>
