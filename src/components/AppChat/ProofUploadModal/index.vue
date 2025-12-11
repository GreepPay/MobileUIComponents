<template>
  <div
    class="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-end"
    @click="handleCancel"
  >
    <div
      class="w-full bg-white rounded-t-3xl max-h-[90vh] overflow-y-auto shadow-2xl border-t border-gray-200"
      @click.stop
    >
      <div class="p-4 pb-4">
        <!-- Header -->

        <div class="flex items-center justify-between mb-4">
          <div class="flex items-center space-x-2">
            <app-header-text class="!text-base">
              Upload Payment Proof
            </app-header-text>
          </div>

          <div class="w-[28px] h-[28px]" @click="handleCancel">
            <app-icon name="close" custom-class="h-[22px]" />
          </div>
        </div>

        <template v-if="paymentMethodMetadata.length > 0">
          <div class="w-full flex flex-col">
            <app-normal-text class="!pb-2 !text-gray-500">
              Complete payment using the following details:
            </app-normal-text>
            <div
              class="w-full flex flex-col border-[1.5px] border-gray-200 rounded-[12px] p-4 mb-4 bg-gray-50"
            >
              <div
                v-for="(value, key) in paymentMethodMetadata"
                :key="key"
                class="w-full flex flex-row mb-3 justify-between items-center"
              >
                <div class="text-left">
                  <app-normal-text>
                    {{ value.title }}:
                    <span class="font-semibold capitalize">{{
                      value.content
                    }}</span>
                  </app-normal-text>
                </div>
                <div class="text-right">
                  <app-icon
                    v-if="value.can_copy"
                    :name="`copy`"
                    custom-class="h-[16px] cursor-pointer"
                    @click="Logic.Common.copytext(value.content)"
                  />
                </div>
              </div>
            </div>
          </div>
        </template>

        <!-- Proof Upload Content -->
        <div class="w-full flex flex-col">
          <app-file-attachment
            v-model="selectedFile"
            :placeholder="
              selectedFile ? selectedFile.name : 'Select proof of payment file'
            "
            accept="image/*,.pdf"
            :is-multiple="false"
            @update:model-value="handleFileSelect"
            isWrapper
          >
            <template #content>
              <div
                class="w-full flex flex-col rounded-md !border-[1.5px] !border-gray-300 !border-dashed h-[100px] items-center justify-center"
              >
                <app-normal-text class="!text-center px-6 !text-gray-600">
                  {{
                    selectedFile?.name
                      ? selectedFile.name
                      : "Please upload a screenshot or photo of your payment confirmation"
                  }}
                </app-normal-text>
              </div>
            </template>
          </app-file-attachment>
        </div>

        <div class="w-full flex flex-col pt-4 pb-4">
          <app-button
            @click="handleUpload"
            variant="secondary"
            class="!py-3"
            :disabled="isUploading"
            :loading="isUploading"
          >
            {{ isUploading ? "⏳ Uploading..." : "🚀 Upload Proof" }}
          </app-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, onMounted, ref } from "vue";
import AppFileAttachment from "../../AppForm/fileAttachment.vue";
import { Logic } from "../../../composable";
import AppIcon from "../../AppIcon";
import { AppHeaderText, AppNormalText } from "../../AppTypography";
import AppButton from "../../AppButton";
import { getChatMetadata } from "../../../composable/useWorkflowEngine";
import { set } from "lodash";

export default defineComponent({
  name: "ProofUploadModal",
  components: {
    AppFileAttachment,
    AppIcon,
    AppHeaderText,
    AppNormalText,
    AppButton,
  },
  props: {
    show: {
      type: Boolean,
      default: false,
    },
  },
  emits: ["cancel", "upload-success", "upload-error"],
  setup(props, { emit }) {
    const selectedFile = ref<File | null>(null);
    const isUploading = ref(false);

    const handleFileSelect = (file: File) => {
      selectedFile.value = file;
    };

    const handleCancel = () => {
      selectedFile.value = null;
      emit("cancel");
    };

    const handleUpload = async () => {
      if (!selectedFile.value) return;

      try {
        isUploading.value = true;
        const fileUrl = await Logic.Wallet.UploadFile(selectedFile.value);

        if (fileUrl) {
          emit("upload-success", {
            fileUrl,
            fileName: selectedFile.value.name,
            fileType: selectedFile.value.type,
          });

          // Clear the file input
          selectedFile.value = null;
        } else {
          throw new Error("Failed to get file URL from upload");
        }
      } catch (error) {
        console.error("Failed to upload proof:", error);
        emit("upload-error", error);
      } finally {
        isUploading.value = false;
      }
    };

    const paymentMethodMetadata = ref<any[]>([]);

    const getPaymentMethodMetadata = () => {
      const chatMetadata: any = getChatMetadata();

      console.log("Chat Metadata getPaymentMethodMetadata:", chatMetadata);

      if (!chatMetadata.merchant_payment_method) {
        return [];
      }

      const paymentMethodData = chatMetadata.merchant_payment_method || null;

      if (paymentMethodData) {
        if (typeof paymentMethodData.meta_data === "string") {
          paymentMethodData.meta_data = JSON.parse(
            JSON.parse(paymentMethodData.meta_data)
          );
        }
      }

      const accountType = paymentMethodData
        ? paymentMethodData.meta_data.type || "N/A"
        : "N/A";

      const listItems = [
        {
          title: "Payment Method",
          content: paymentMethodData
            ? paymentMethodData.meta_data.type.replaceAll("_", " ")
            : "N/A",
        },
        {
          title:
            accountType == "bank_account"
              ? "Bank Name"
              : "Mobile Money Provider",
          content: paymentMethodData
            ? paymentMethodData.bank_name || "N/A"
            : "N/A",
          can_copy: true,
        },
        {
          title:
            accountType == "bank_account" ? "Account Number" : "Phone Number",
          content: paymentMethodData
            ? paymentMethodData.account_number || "N/A"
            : "N/A",
          can_copy: true,
        },
        {
          title: "Account Name",
          content: paymentMethodData
            ? paymentMethodData.account_name || "N/A"
            : "N/A",
          can_copy: true,
        },
      ];

      paymentMethodMetadata.value = listItems;
    };

    onMounted(() => {
      getPaymentMethodMetadata();

      setTimeout(() => {
        getPaymentMethodMetadata();
      }, 500);

      setTimeout(() => {
        getPaymentMethodMetadata();
      }, 1000);

      setTimeout(() => {
        getPaymentMethodMetadata();
      }, 1500);
    });

    return {
      selectedFile,
      isUploading,
      handleFileSelect,
      handleCancel,
      handleUpload,
      paymentMethodMetadata,
      Logic,
    };
  },
});
</script>
