<template>
  <div :id="uniqueId" class="!py-3"></div>
</template>

<script lang="ts">
import { defineComponent, onMounted } from "vue";
// Dynamic import to avoid ES module issues
let QRCode: any;

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
        Math.random().toString(36).substring(2, 15)

    onMounted(async () => {
      try {
        // Dynamically import QR code library
        const qrcodeModule = await import('qrcode');
        QRCode = qrcodeModule.default || qrcodeModule;
        
        setTimeout(() => {
          const canvas = document.getElementById(uniqueId);

          // Calculate parent container inner width
          const parentWidth = canvas?.parentElement?.clientWidth;
          if (canvas && QRCode) {
            QRCode.toCanvas(canvas, props.data.toString(), {
              width: parentWidth,
            });
          }
        }, 500);
      } catch (error) {
        console.error('Failed to load QR code library:', error);
      }
    });

      return {
        uniqueId,
      } 
    },
  })
</script>
