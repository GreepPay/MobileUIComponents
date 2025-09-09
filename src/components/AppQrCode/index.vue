<template>
  <div :id="uniqueId" class="!py-3"></div>
</template>

<script lang="ts">
  import { defineComponent, onMounted, watch } from "vue"
  import QRCodeStyling from "qr-code-styling"

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

      let qrCode: QRCodeStyling | null = null

      const renderQr = () => {
        const container = document.getElementById(uniqueId)
        if (!container) return

        const parentWidth = container?.parentElement?.clientWidth || 200
        const parentHeight = container?.parentElement?.clientHeight || 200

        // Clear previous QR before appending new one
        container.innerHTML = ""

        qrCode = new QRCodeStyling({
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
        })

        qrCode.append(container)
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

      return { uniqueId }
    },
  })
</script>
