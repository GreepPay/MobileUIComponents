<template>
  <div v-if="show" class="fixed inset-0 bg-white bg-opacity-60 z-50 flex items-end" @click="handleCancel">
    <div class="w-full bg-white rounded-t-3xl max-h-[90vh] overflow-y-auto shadow-2xl border-t border-gray-200"
      @click.stop>
      <div class="p-4 pb-8">
        <!-- Handle bar -->
        <div class="w-12 h-1 bg-gray-300 rounded-full mx-auto mb-4"></div>

        <!-- Header -->
        <div class="flex items-center justify-between mb-6">
          <button @click="handleCancel"
            class="text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-100 transition-colors">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <!-- Proof Upload Content -->
        <div class="proof-upload-section">
          <div class="proof-upload-header">
            <h4>📸 Upload Proof of Payment</h4>
            <p>Please upload a screenshot or photo of your payment confirmation</p>
          </div>

          <div class="proof-upload-content">
            <app-file-attachment v-model="selectedFile"
              :placeholder="selectedFile ? selectedFile.name : 'Select proof of payment file'" accept="image/*,.pdf"
              :is-multiple="false" @update:model-value="handleFileSelect" />

            <button v-if="selectedFile" @click="handleUpload" class="upload-proof-btn" :disabled="isUploading">
              {{ isUploading ? '⏳ Uploading...' : '🚀 Upload Proof' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import AppFileAttachment from '../../AppForm/fileAttachment.vue';
import { Logic } from '../../../composable';

export default defineComponent({
  name: 'ProofUploadModal',
  components: {
    AppFileAttachment,
  },
  props: {
    show: {
      type: Boolean,
      default: false,
    },
  },
  emits: ['cancel', 'upload-success', 'upload-error'],
  setup(props, { emit }) {
    const selectedFile = ref<File | null>(null);
    const isUploading = ref(false);

    const handleFileSelect = (file: File) => {
      selectedFile.value = file;
    };

    const handleCancel = () => {
      selectedFile.value = null;
      emit('cancel');
    };

    const handleUpload = async () => {
      if (!selectedFile.value) return;

      try {
        isUploading.value = true;
        const fileUrl = await Logic.Wallet.UploadFile(selectedFile.value);

        if (fileUrl) {
          emit('upload-success', {
            fileUrl,
            fileName: selectedFile.value.name,
            fileType: selectedFile.value.type,
          });

          // Clear the file input
          selectedFile.value = null;
        } else {
          throw new Error('Failed to get file URL from upload');
        }
      } catch (error) {
        console.error('Failed to upload proof:', error);
        emit('upload-error', error);
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

<style scoped>
.proof-upload-section {
  background: transparent;
  border-radius: 16px;
  padding: 20px;
  margin: 20px 0;
  color: #333;
  border: 2px dashed #e5e7eb;
}

.proof-upload-header h4 {
  margin: 0 0 8px 0;
  font-size: 18px;
  font-weight: 600;
  color: #1f2937;
}

.proof-upload-header p {
  margin: 0 0 20px 0;
  opacity: 0.8;
  font-size: 14px;
  color: #6b7280;
}

.proof-upload-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.upload-proof-btn {
  background: #4CAF50;
  border: none;
  color: white;
  padding: 14px 24px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  font-size: 16px;
  transition: all 0.3s ease;
  align-self: flex-start;
}

.upload-proof-btn:hover:not(:disabled) {
  background: #45a049;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(76, 175, 80, 0.3);
}

.upload-proof-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  transform: none;
}
</style>