import { ref, computed, watch } from "vue";
import { Logic } from "./";
import {
  DeliveryAddress,
  P2pPaymentMethod,
} from "@greep/logic/src/gql/graphql";

export interface WorkflowInputOptions {
  workflowType: "p2p_withdrawal" | "deliveries";
  conversationId: number;
  conversation?: any;
}

export interface InputHandler {
  handleAddressSelection: (address: any) => Promise<boolean>;
  handleAddressCancel: () => void;
  handleBankDetailsSubmitted: (
    bankForm: any,
    savedAccount?: any
  ) => Promise<boolean>;
  handleSavedAccountSelected: (account: any) => Promise<boolean>;
  handleBankTransferCancel: () => void;
  handlePickupSelection: (location: any) => Promise<boolean>;
  handlePickupCancel: () => void;
}

export const useWorkflowInput = (
  options: WorkflowInputOptions,
  sendMessage: (
    content: string,
    metadata?: any,
    forceDirect?: boolean,
    forceWorkflow?: boolean
  ) => Promise<boolean>,
  manualModalOverride: any
) => {
  // Reactive state
  const savedBankAccounts = ref<any[]>([]);
  const showProofModal = ref(false);

  // Modal management based on workflow type
  const getModalForWorkflow = (modalType: string) => {
    const { workflowType } = options;

    // P2P Withdrawal specific modals
    if (workflowType === "p2p_withdrawal") {
      switch (modalType) {
        case "bank_transfer":
        case "cash_pickup":
        case "address":
          return modalType;
        default:
          return null;
      }
    }

    // Deliveries specific modals
    if (workflowType === "deliveries") {
      switch (modalType) {
        case "address":
        case "proof_upload":
          return modalType;
        default:
          return null;
      }
    }

    return null;
  };

  // Load saved bank accounts (P2P specific)
  const loadSavedBankAccounts = async () => {
    // if (options.workflowType !== "p2p_withdrawal") return;

    try {
      const response = await Logic.Wallet.GetP2pPaymentMethods(50, 1);

      const accounts = response?.data || response || [];
      savedBankAccounts.value = Array.isArray(accounts) ? accounts : [];

      console.log(
        "✅ Loaded saved bank accounts:",
        savedBankAccounts.value.length
      );
      console.log("🔍 First account structure:", savedBankAccounts.value[0]);
    } catch (error) {
      console.error("❌ Failed to load saved bank accounts:", error);
      savedBankAccounts.value = [];
    }
  };

  // Business store locations (P2P specific)
  const businessStoreLocations = computed(() => {
    if (options.workflowType !== "p2p_withdrawal") return [];

    // Use type assertion since the API Gateway now includes exchangeAd
    const conversationWithExchangeAd = options.conversation as any;
    const storeLocations =
      conversationWithExchangeAd?.exchangeAd?.business?.storeLocations || [];

    return storeLocations
      .filter(
        (location: any) =>
          location.name && location.address && location.city && location.country
      )
      .map((location: any) => ({
        name: location.name || "",
        address: location.address || "",
        city: location.city || "",
        country: location.country || "",
        __typename: location.__typename || "StoreLocation",
      }));
  });

  // Helper function to determine address type from last message
  const getAddressType = () => {
    try {
      // Try to get the current conversation and last AI message
      const conversation = Logic.Messaging.SingleConversation;
      if (!conversation?.messages) return "delivery";

      const lastAIMessage = conversation.messages
        .slice()
        .reverse()
        .find((msg: any) => msg.user_id === 0 || msg.user_uuid === "greep_ai");

      if (!lastAIMessage?.metadata) return "delivery";

      // Handle metadata that might be a string or object
      let metadata = lastAIMessage.metadata;
      if (typeof metadata === "string") {
        try {
          metadata = JSON.parse(metadata);
        } catch {
          return "delivery";
        }
      }

      const extras = (metadata as any)?.extras;
      if (!extras) return "delivery";

      // Handle extras that might be a string or object
      let extrasObj = extras;
      if (typeof extras === "string") {
        try {
          extrasObj = JSON.parse(extras);
        } catch {
          return "delivery";
        }
      }

      // Check if it's a pickup address based on content or input name
      const content = lastAIMessage.content?.toLowerCase() || "";
      const inputName = extrasObj?.input_name?.toLowerCase() || "";

      if (content.includes("pickup") || inputName.includes("pickup")) {
        return "pickup";
      }

      return "delivery";
    } catch (error) {
      console.error("Error determining address type:", error);
      return "delivery";
    }
  };

  // Input handlers
  const handleAddressSelection = async (address: any): Promise<boolean> => {
    // Handle both string addresses and object addresses
    const addressText =
      typeof address === "string"
        ? address
        : address.formatted || address.name || address.address || address;

    console.log("📍 Address selection:", { address, addressText });

    // Determine if this is pickup or delivery address
    const addressType = getAddressType();
    const metadata: any = {
      selected_option: "string",
    };

    // Set the correct field based on address type
    if (addressType === "pickup") {
      metadata.pickup_address = addressText;
    } else {
      metadata.delivery_address = addressText;
    }

    console.log("📍 Sending address with metadata:", metadata);

    const success = await sendMessage(addressText, metadata);

    if (success) {
      manualModalOverride.value = null;
    }
    return success;
  };

  const handleAddressCancel = () => {
    console.log("📍 Address modal cancelled");
    manualModalOverride.value = "closed";
  };

  const handleBankDetailsSubmitted = async (
    bankForm: any,
    savedAccount?: any
  ): Promise<boolean> => {
    // if (options.workflowType !== "p2p_withdrawal") return false;

    try {
      // Set up the form data for creating P2P payment method
      Logic.Wallet.CreateP2pPaymentMethodForm = {
        bank_name: bankForm.bankName,
        account_number: bankForm.accountNumber,
        account_name: bankForm.accountName,
        currency: bankForm.currency,
        meta_data: JSON.stringify({
          added_via: "transfer_chat",
          timestamp: Date.now(),
        }),
      };

      const newSavedAccount = await Logic.Wallet.CreateP2pPaymentMethod();

      // Convert P2pPaymentMethod to BankAccount format for consistency
      const bankAccount = newSavedAccount
        ? {
            uuid: newSavedAccount.uuid,
            bank_name: newSavedAccount.bank_name || "",
            account_number: newSavedAccount.account_number || "",
            account_name: newSavedAccount.account_name || "",
            currency: newSavedAccount.currency || "TRY",
          }
        : savedAccount;

      // Send message with the bank account details
      const displayText = `${bankAccount.bank_name} - ${bankAccount.account_number} (${bankAccount.account_name})`;
      const success = await sendMessage(`Bank: ${displayText}`, {
        bank_account: bankAccount,
      });

      if (success) {
        manualModalOverride.value = "closed";
        // Refresh saved bank accounts
        await loadSavedBankAccounts();
      }

      return success;
    } catch (error) {
      console.error("Failed to save bank account:", error);
      return false;
    }
  };

  const handleSavedAccountSelected = async (account: any): Promise<boolean> => {
    // if (options.workflowType !== "p2p_withdrawal") return false;

    const displayText = `${account.bank_name} - ${account.account_number} (${account.account_name})`;

    const success = await sendMessage(`Bank: ${displayText}`, {
      bank_account: account,
      selected_option: "string",
    });

    if (success) {
      manualModalOverride.value = "closed";
    }

    return success;
  };

  const handleMerchantAccountSelected = async (
    account: P2pPaymentMethod
  ): Promise<boolean> => {
    const displayText = `{payment_method_summary}`;

    const success = await sendMessage(
      displayText,
      {
        merchant_payment_method: account,
        selected_option: "confirm",
      },
      false,
      true
    );

    return success;
  };

  const handleBankTransferCancel = () => {
    manualModalOverride.value = "closed";
  };

  const handlePickupSelection = async (
    location: DeliveryAddress
  ): Promise<boolean> => {
    // if (options.workflowType !== "p2p_withdrawal") return false;

    const displayText = `${location.name} - ${location.description}. <a class="!underline" href="${location.google_map_link}" target="_blank" rel="noopener noreferrer">See on map</a>`;

    const success = await sendMessage(`Pickup: ${displayText}`, {
      selected_option: "branch_selected",
      selected_option_data_type: "string",
      pickup_location: location,
    });

    if (success) {
      manualModalOverride.value = null;
    }

    return success;
  };

  const handlePickupCancel = () => {
    console.log("📍 Pickup modal cancelled");
    manualModalOverride.value = null;
  };

  // Proof upload handlers (shared across workflows)
  const handleUploadProof = async () => {
    try {
      console.log("📸 Upload proof clicked - showing proof modal");
      showProofModal.value = true;
    } catch (error) {
      console.error("❌ Error showing proof modal:", error);
    }
  };

  const handleProofUploadFiles = async (
    files: File[],
    notes: string
  ): Promise<boolean> => {
    try {
      // Generate proof content based on files and notes
      const fileCount = files.length;
      const fileTypes = files.map((f) =>
        f.type.startsWith("image/") ? "photo" : "document"
      );
      const hasPhotos = fileTypes.includes("photo");
      const hasDocs = fileTypes.includes("document");

      let proofContent = "";
      if (hasPhotos && hasDocs) {
        proofContent = `📸📄 ${fileCount} files uploaded (photos & documents)`;
      } else if (hasPhotos) {
        proofContent = `📷 ${fileCount} photo(s) uploaded`;
      } else {
        proofContent = `📄 ${fileCount} document(s) uploaded`;
      }

      // Add notes if provided
      if (notes.trim()) {
        proofContent += ` - ${notes.trim()}`;
      }

      // Send proof upload message
      const success = await sendMessage(
        `📸 **PROOF UPLOADED** - ${proofContent}`
      );

      if (success) {
        showProofModal.value = false;
        console.log("✅ Proof upload message sent successfully");
      }

      return success;
    } catch (error) {
      console.error("❌ Error uploading proof files:", error);
      return false;
    }
  };

  const handleProofCancel = () => {
    console.log("📸 Proof upload cancelled");
    showProofModal.value = false;
  };

  return {
    // State
    savedBankAccounts,
    showProofModal,
    businessStoreLocations,

    // Methods
    loadSavedBankAccounts,
    getModalForWorkflow,

    // Input handlers
    handleAddressSelection,
    handleAddressCancel,
    handleBankDetailsSubmitted,
    handleSavedAccountSelected,
    handleBankTransferCancel,
    handlePickupSelection,
    handlePickupCancel,
    handleUploadProof,
    handleProofUploadFiles,
    handleProofCancel,
    handleMerchantAccountSelected,
  };
};
