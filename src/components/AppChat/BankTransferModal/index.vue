<template>
  <div v-if="show" class="fixed inset-0 bg-white bg-opacity-60 z-50 flex items-end" @click="handleCancel">
    <div class="w-full bg-white rounded-t-3xl max-h-[90vh] overflow-y-auto shadow-2xl border-t border-gray-200"
      @click.stop>
      <div class="p-4 pb-8">
        <!-- Handle bar -->
        <div class="w-12 h-1 bg-gray-300 rounded-full mx-auto mb-4"></div>

        <!-- Header -->
        <div class="flex items-center justify-between mb-6">
          <div class="flex items-center space-x-2">
            <span class="text-xl">🏦</span>
            <span class="text-lg font-semibold text-gray-800">Bank Account Details</span>
          </div>
          <button @click="handleCancel" class="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <svg class="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>

        <!-- Saved Bank Accounts Section -->
        <div v-if="shouldShowSavedAccounts">
          <p class="modal-description">💳 Choose from your saved bank accounts</p>

          <div class="saved-accounts-list">
            <div v-for="account in savedBankAccounts" :key="account.uuid" @click="selectSavedAccount(account)"
              class="saved-account-item">
              <div class="account-info">
                <div class="bank-name">{{ account.bank_name }}</div>
                <div class="account-details">{{ account.account_number }} • {{ account.account_name }}</div>
                <div v-if="account.currency" class="account-currency">{{ account.currency }}</div>
              </div>
              <div class="select-icon">→</div>
            </div>
          </div>

          <button @click="showAddNewForm = true" class="add-new-btn">
            + Add New Bank Account
          </button>
        </div>

        <!-- Add New Bank Account Form -->
        <div v-if="shouldShowForm">
          <p class="modal-description">
            {{ savedBankAccounts && savedBankAccounts.length > 0 ? 'Add a new bank account' : 'Enter your bank account details for the transfer' }}
          </p>

          <div class="bank-form">
            <div class="form-group">
              <label for="bank-name">Bank Name:</label>
              <input id="bank-name" v-model="bankForm.bankName" type="text" placeholder="e.g. First Bank of Nigeria"
                class="form-input" ref="bankInputRef" />
            </div>

            <div class="form-group">
              <label for="account-number">Account Number:</label>
              <input id="account-number" v-model="bankForm.accountNumber" type="text" placeholder="e.g. 1234567890"
                class="form-input" maxlength="20" />
            </div>

            <div class="form-group">
              <label for="account-name">Account Holder Name:</label>
              <input id="account-name" v-model="bankForm.accountName" type="text" placeholder="e.g. John Doe"
                class="form-input" />
            </div>

            <div class="form-group">
              <label for="currency">Currency:</label>
              <select id="currency" v-model="bankForm.currency" class="form-select">
                <option value="TRY">TRY - Turkish Lira</option>
                <option value="NGN">NGN - Nigerian Naira</option>
                <option value="USD">USD - US Dollar</option>
                <option value="GHS">GHS - Ghanaian Cedi</option>
                <option value="KES">KES - Kenyan Shilling</option>
                <option value="ZAR">ZAR - South African Rand</option>
              </select>
            </div>

            <div v-if="savedBankAccounts && savedBankAccounts.length > 0" class="back-button-container">
              <button @click="showAddNewForm = false" class="back-to-saved-btn">
                ← Back to Saved Accounts
              </button>
            </div>
          </div>
        </div>

        <!-- Error Message -->
        <div v-if="errorMessage" class="error-message">
          <span class="error-icon">⚠️</span>
          {{ errorMessage }}
        </div>
      </div>

      <div class="modal-footer">
        <button class="btn-secondary" @click="handleCancel">
          Cancel
        </button>
        <button class="btn-primary" @click="handleConfirm" :disabled="!canConfirm || isSubmitting">
          {{ confirmButtonText }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick, onMounted, watch } from 'vue';

interface BankAccount {
  uuid: string;
  bank_name: string;
  account_number: string;
  account_name: string;
  currency?: string;
  meta_data?: string;
}

interface BankForm {
  bankName: string;
  accountNumber: string;
  accountName: string;
  currency: string;
}

interface Props {
  show: boolean;
  savedBankAccounts?: BankAccount[];
  isProcessing?: boolean;
  onConfirm?: Function;
  onCancel?: Function;
}

const props = withDefaults(defineProps<Props>(), {
  show: false,
  savedBankAccounts: () => [],
  isProcessing: false,
});

const emit = defineEmits<{
  'bank-details-submitted': [bankDetails: BankForm, savedAccount?: BankAccount];
  'saved-account-selected': [account: BankAccount];
  'cancel': [];
  'confirm': [data: any];
}>();

// Reactive data
const showAddNewForm = ref(false);
const isSubmitting = ref(false);
const errorMessage = ref('');
const bankInputRef = ref<HTMLInputElement>();

// Watch for saved accounts and ensure we show the list first
watch(() => props.savedBankAccounts, (newAccounts) => {
  if (newAccounts && newAccounts.length > 0) {
    showAddNewForm.value = false; // Always show saved accounts first
  }
}, { immediate: true });

const bankForm = ref<BankForm>({
  bankName: '',
  accountNumber: '',
  accountName: '',
  currency: 'NGN'
});

// Computed properties
const hasSavedAccounts = computed(() => {
  const hasAccounts = props.savedBankAccounts && props.savedBankAccounts.length > 0;
  console.log("🔧 BankTransferModal hasSavedAccounts:", hasAccounts, "showAddNewForm:", showAddNewForm.value);
  return hasAccounts;
});

const shouldShowSavedAccounts = computed(() => {
  return hasSavedAccounts.value && !showAddNewForm.value;
});

const shouldShowForm = computed(() => {
  return showAddNewForm.value || !hasSavedAccounts.value;
});

const canConfirm = computed(() => {
  return (
    bankForm.value.bankName.trim() &&
    bankForm.value.accountNumber.trim() &&
    bankForm.value.accountName.trim() &&
    bankForm.value.currency
  );
});

const confirmButtonText = computed(() => {
  if (isSubmitting.value) return 'Saving...';
  return props.savedBankAccounts && props.savedBankAccounts.length > 0 ? 'Save & Continue' : 'Continue';
});

// Methods
const handleConfirm = async () => {
  if (!canConfirm.value) return;

  isSubmitting.value = true;
  errorMessage.value = '';

  try {
    // Just create the bank account object from form data
    const bankAccount: BankAccount = {
      uuid: '', // Will be set by the API in parent component
      bank_name: bankForm.value.bankName,
      account_number: bankForm.value.accountNumber,
      account_name: bankForm.value.accountName,
      currency: bankForm.value.currency
    };

    // Emit the form data - let parent handle the API call
    emit('bank-details-submitted', bankForm.value, bankAccount);

    // Also emit confirm for backward compatibility
    emit('confirm', bankAccount);

    // Call prop function if provided (for backward compatibility)
    if (props.onConfirm) {
      props.onConfirm(bankAccount);
    }
  } catch (error) {
    console.error('Failed to process bank account:', error);
    errorMessage.value = 'Failed to process bank account. Please try again.';
  } finally {
    isSubmitting.value = false;
  }
};

const selectSavedAccount = (account: BankAccount) => {
  console.log('🏦 Selecting saved account:', account);

  // Emit the saved account selection
  emit('saved-account-selected', account);

  // Also emit confirm for backward compatibility
  emit('confirm', account);

  // Call prop function if provided (for backward compatibility)
  if (props.onConfirm) {
    props.onConfirm(account);
  }
};

const handleCancel = () => {
  console.log('🏦 BankTransferModal: Cancelling');

  // Reset form
  resetForm();

  // Emit cancel event
  emit('cancel');

  // Call prop function if provided (for backward compatibility)  
  if (props.onCancel) {
    props.onCancel();
  }
};

const resetForm = () => {
  showAddNewForm.value = false;
  bankForm.value = {
    bankName: '',
    accountNumber: '',
    accountName: '',
    currency: 'NGN'
  };
  errorMessage.value = '';
};

// Reset form when modal is closed
watch(() => props.show, (newVal) => {
  if (!newVal) {
    resetForm();
  }
});

// Initialize on mount
onMounted(() => {
  nextTick(() => {
    // If no saved accounts, show add new form
    if (!props.savedBankAccounts || props.savedBankAccounts.length === 0) {
      showAddNewForm.value = true;
      nextTick(() => {
        if (bankInputRef.value) {
          bankInputRef.value.focus();
        }
      });
    }
  });
});
</script>

<style scoped>
.modal-description {
  margin: 0 0 1.5rem 0;
  color: #6c757d;
  line-height: 1.5;
}

/* Saved Bank Accounts Styles */
.saved-accounts-list {
  margin-bottom: 1rem;
}

.saved-account-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem;
  border: 1px solid #e9ecef;
  border-radius: 0.375rem;
  margin-bottom: 0.5rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.saved-account-item:hover {
  border-color: #007bff;
  background: #f8f9fa;
}

.account-info {
  flex: 1;
}

.bank-name {
  font-weight: 500;
  color: #495057;
  margin-bottom: 0.25rem;
}

.account-details {
  font-size: 0.85rem;
  color: #6c757d;
  margin-bottom: 0.25rem;
}

.account-currency {
  font-size: 0.75rem;
  color: #007bff;
  font-weight: 500;
}

.select-icon {
  color: #007bff;
  font-weight: bold;
}

.add-new-btn {
  width: 100%;
  padding: 0.75rem;
  border: 2px dashed #ced4da;
  background: transparent;
  color: #6c757d;
  border-radius: 0.375rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.add-new-btn:hover {
  border-color: #007bff;
  color: #007bff;
}

/* Form Styles */
.bank-form {
  margin-top: 1rem;
}

.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #495057;
}

.form-input,
.form-select {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ced4da;
  border-radius: 0.375rem;
  font-size: 0.9rem;
  font-family: inherit;
  transition: all 0.2s ease;
}

.form-input:focus,
.form-select:focus {
  outline: none;
  border-color: #007bff;
  box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.1);
}

.back-button-container {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #e9ecef;
}

.back-to-saved-btn {
  padding: 0.5rem 1rem;
  background: transparent;
  border: 1px solid #ced4da;
  color: #6c757d;
  border-radius: 0.375rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.back-to-saved-btn:hover {
  background: #f8f9fa;
  border-color: #007bff;
  color: #007bff;
}

.error-message {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem;
  background: #f8d7da;
  border: 1px solid #f5c6cb;
  border-radius: 0.375rem;
  color: #721c24;
  font-size: 0.85rem;
  margin-top: 1rem;
}

.error-icon {
  font-size: 1rem;
}

/* Footer Styles */
.modal-footer {
  display: flex;
  gap: 0.75rem;
  justify-content: flex-end;
  padding: 1rem 1.5rem 1.5rem;
  border-top: 1px solid #e9ecef;
}

.btn-primary,
.btn-secondary {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 0.375rem;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-primary {
  background: #007bff;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: #0056b3;
}

.btn-primary:disabled {
  background: #6c757d;
  cursor: not-allowed;
  opacity: 0.6;
}

.btn-secondary {
  background: #6c757d;
  color: white;
}

.btn-secondary:hover {
  background: #545b62;
}

/* Mobile optimizations */
@media (max-width: 768px) {
  .saved-account-item {
    padding: 0.75rem;
  }

  .bank-name {
    font-size: 0.9rem;
  }

  .account-details {
    font-size: 0.8rem;
  }
}
</style>