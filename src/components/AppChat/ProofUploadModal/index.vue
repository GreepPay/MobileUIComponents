<template>
  <div
    v-if="show"
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
            <app-header-text> Upload Payment Proof </app-header-text>
          </div>

          <div class="w-[28px] h-[28px]" @click="handleCancel">
            <app-icon name="close" custom-class="h-[22px]" />
          </div>
        </div>

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
import { defineComponent, ref } from "vue";
import AppFileAttachment from "../../AppForm/fileAttachment.vue";
import { Logic } from "../../../composable";
import AppIcon from "../../AppIcon";
import { AppHeaderText, AppNormalText } from "../../AppTypography";
import AppButton from "../../AppButton";

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

    return {
      selectedFile,
      isUploading,
      handleFileSelect,
      handleCancel,
      handleUpload,
    };
  },
});
</script>
