<template>
  <div class="flex flex-col space-y-4 w-full">
    <h3 class="text-lg font-medium">Default OTP Input</h3>
    <app-otp-input :on-change-otp="handleOTPChange" v-model="otpValue" />

    <div class="text-sm text-gray-600">
      Current OTP: {{ otpValue || "Not entered" }}
    </div>

    <h3 class="text-lg font-medium mt-6">Custom Length (6 digits)</h3>
    <app-otp-input
      :number-of-input="6"
      :on-change-otp="handleOTPChange"
      v-model="otpValue2"
    />

    <h3 class="text-lg font-medium mt-6">Error State</h3>
    <app-otp-input
      :is-error="true"
      :on-change-otp="handleOTPChange"
      v-model="otpValue3"
    />

    <h3 class="text-lg font-medium mt-6">Disabled State</h3>
    <app-otp-input
      :is-disabled="true"
      :on-change-otp="handleOTPChange"
      v-model="otpValue4"
    />
  </div>
</template>

<script setup>
  import { ref } from "vue"
  import AppOTPInput from "../../../components/AppForm/otpInput.vue"

  const otpValue = ref("")
  const otpValue2 = ref("")
  const otpValue3 = ref("")
  const otpValue4 = ref("123")

  const handleOTPChange = (value) => {}
</script>
