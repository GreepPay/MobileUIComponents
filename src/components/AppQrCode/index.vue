<template>
  <canvas :id="uniqueId"></canvas>
</template>
<script lang="ts">
  import { defineComponent, onMounted, watch, ref } from "vue"
  import QRCode from "qrcode"

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
        Math.random().toString(36).substring(2, 15)

      const renderQr = () => {
        const canvas = document.getElementById(uniqueId)

        // Calculate parent conainer inner width
        const parentWidth = canvas?.parentElement?.clientWidth
        if (canvas) {
          QRCode.toCanvas(canvas, props.data.toString(), {
            width: parentWidth,
          })
        }
      }

      onMounted(() => {
        setTimeout(() => renderQr(), 500)
      })

      watch(
        () => props.data,
        (newValue) => {
          if (newValue) renderQr()
        }
      )

      return {
        uniqueId,
      }
    },
  })
</script>
