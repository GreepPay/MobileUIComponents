<template>
  <div :id="uniqueId" class="!py-3" ></div>
</template>
<script lang="ts">
import { defineComponent, onMounted } from "vue";
import QRCodeStyling from "qr-code-styling";

/**
 * AppQrCode Component
 *
 * This component generates a QR code based on the provided data.
 */
export default defineComponent({
  props: {
    /**
     *  The data to be encoded in the QR code.
     *  @required
     */
    data: {
      type: String,
      required: true,
    },
  },
  name: "AppQrCode",
  setup(props) {
    const uniqueId =
      Math.random().toString(36).substring(2, 15) +
      Math.random().toString(36).substring(2, 15);

    onMounted(() => {
      setTimeout(() => {
        const canvas = document.getElementById(uniqueId);

        // Calculate parent conainer inner width
        const parentWidth = canvas?.parentElement?.clientWidth;
        const parentHeight = canvas?.parentElement?.clientHeight;
        if (canvas) {
        const qrCode =  new QRCodeStyling({
            width: parentWidth,
            height: parentHeight,
            type: "svg",
            data: props.data.toString(),
            image: "https://greep.blob.core.windows.net/greep/logo.png",
            dotsOptions: {
              color: "#000000",
              type: "rounded",
            },
            backgroundOptions: {
              color: "#ffffff",
            },
            imageOptions: {
              margin: 8,
              crossOrigin: "anonymous",
            },
          });
          qrCode.append(canvas);
          // QRCode.toCanvas(canvas, props.data.toString(), {
          //   width: parentWidth,

          // });
        }
      }, 500);
    });

    return {
      uniqueId,
    };
  },
});
</script>
