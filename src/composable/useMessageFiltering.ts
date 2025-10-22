import { ComputedRef, Ref } from "vue";

export interface MessageFilteringContext {
  isBusinessUser: ComputedRef<boolean>;
  AuthUser: Ref<any>;
  SingleConversation: Ref<any>;
  orderConfirmed: Ref<boolean>;
  showAddressInput: Ref<boolean>;
  proofUploaded: Ref<boolean>;
  showPaymentConfirmation: Ref<boolean>;
  startCountdown: (
    type: "waiting_business" | "payment_confirmation" | "send_usdc",
    duration: number
  ) => void;
  scrollToBottom: () => Promise<void>;
  messages: any[];
}

export interface MessageToFilter {
  id: string | number;
  content?: string;
  text_content?: string;
  user_uuid?: string;
  user_name?: string;
  sender?: {
    uuid?: string;
    first_name?: string;
    last_name?: string;
  };
  metadata?: string;
}

export interface FilterResult {
  shouldBlock: boolean;
  reason?: string;
  replacementMessage?: any;
  sideEffects?: () => void;
}

export function useMessageFiltering(context: MessageFilteringContext) {
  /**
   * Filter out currency error messages
   */
  const filterCurrencyErrors = (message: MessageToFilter): FilterResult => {
    const content = message.text_content || message.content;
    if (content?.includes("Currency must be a string.")) {
      return {
        shouldBlock: true,
        reason: "Currency error message filtered",
      };
    }
    return { shouldBlock: false };
  };

  /**
   * Handle order confirmation messages and transform them
   */
  const handleOrderConfirmation = (message: MessageToFilter): FilterResult => {
    const content = message.text_content || message.content;
    if (
      content?.includes(
        "Your order has been confirmed. Please wait for the confirmation email."
      )
    ) {
      console.log(
        "🚫 Filtering out confirmation email message, proceeding to next stage"
      );

      return {
        shouldBlock: true,
        reason: "Order confirmation email transformed",
        replacementMessage: {
          id: `order_confirmed_${Date.now()}`,
          type: "text" as const,
          text_content:
            "Order confirmed! Your P2P trade has been created successfully.",
          user_uuid: "greep_ai",
          user_name: "GreepPay AI",
          info_icon: "",
          actions: [
            {
              label: "View order details",
              message: "View order details",
              type: "success" as const,
              value: "view_order",
              handler: () => {
                console.log("View order details clicked");
                // Handle view order
              },
            },
          ],
          orderSummary: null,
          isOrderSummary: false,
        },
        sideEffects: () => {
          context.orderConfirmed.value = true;
          context.showAddressInput.value = false;
          console.log(
            "🎯 BACKEND CONFIRMATION: orderConfirmed set to true, showAddressInput set to false"
          );
        },
      };
    }
    return { shouldBlock: false };
  };

  /**
   * Filter business-side seller-only messages
   */
  const filterBusinessSideMessages = (
    message: MessageToFilter
  ): FilterResult => {
    if (!context.isBusinessUser.value) {
      return { shouldBlock: false };
    }

    const lcContent = (message.text_content || message.content || "")
      .toString()
      .toLowerCase();

    const sellerOnlyPatterns = [
      'pressing the "payment confirmed"',
      "payment confirmed.*release usdc",
      "are you sure that you have collected your cash",
    ];

    const isSellerOnly = sellerOnlyPatterns.some((pattern) =>
      new RegExp(pattern, "i").test(lcContent)
    );

    if (isSellerOnly) {
      return {
        shouldBlock: true,
        reason: "Seller-only message filtered for business user",
      };
    }

    return { shouldBlock: false };
  };

  /**
   * Handle payment confirmation message from backend
   */
  const handlePaymentConfirmation = (
    message: MessageToFilter
  ): FilterResult => {
    const content = message.text_content || message.content;

    if (
      content?.includes("Order confirmed! Pressing the") &&
      content?.includes("Payment confirmed")
    ) {
      console.log(
        "🔧 Payment confirmation message from backend detected - hiding verbose message"
      );

      // Always block this verbose message as the button functionality is preserved elsewhere
      return {
        shouldBlock: true,
        reason:
          "Hiding verbose payment confirmation message while preserving button functionality",
        sideEffects: () => {
          // Make bottom bar a free chat input from now on
          context.orderConfirmed.value = true;
          context.showAddressInput.value = false;
          console.log(
            "🎯 PAYMENT CONFIRMATION: orderConfirmed set to true, showAddressInput set to false"
          );
        },
      };
    }

    return { shouldBlock: false };
  };

  /**
   * Handle address confirmation step
   */
  const handleAddressConfirmation = (
    message: MessageToFilter
  ): FilterResult => {
    const content = message.content || message.text_content;
    if (
      content?.includes("What is your address") &&
      !content?.includes("Is this your correct address")
    ) {
      console.log(
        "🔧 Address question detected, will show confirmation after user responds"
      );
      // This will be handled when user responds with address
    }
    return { shouldBlock: false };
  };

  /**
   * Handle proof upload messages
   */
  const handleProofUpload = (message: MessageToFilter): FilterResult => {
    const metadata = message.metadata ? JSON.parse(message.metadata) : {};
    const rawType = metadata?.type || "text";

    // Check for proof upload by metadata type
    if (rawType === "proof_upload") {
      return {
        shouldBlock: false,
        sideEffects: () => {
          context.proofUploaded.value = true;
          if (!context.isBusinessUser.value) {
            context.showPaymentConfirmation.value = true;
            // Start payment confirmation countdown (30 minutes)
            context.startCountdown("payment_confirmation", 1800);
          }
        },
      };
    }

    return { shouldBlock: false };
  };

  /**
   * Main filtering pipeline - runs all filters in sequence
   */
  const filterMessage = async (
    message: MessageToFilter
  ): Promise<FilterResult> => {
    // Run filters in order of importance
    const filters = [
      filterCurrencyErrors,
      handleOrderConfirmation,
      filterBusinessSideMessages,
      handlePaymentConfirmation,
      handleAddressConfirmation,
      handleProofUpload,
    ];

    for (const filter of filters) {
      const result = filter(message);

      if (
        result.shouldBlock ||
        result.replacementMessage ||
        result.sideEffects
      ) {
        // Execute side effects if any
        if (result.sideEffects) {
          result.sideEffects();
        }

        // If there's a replacement message, add it
        if (result.replacementMessage) {
          context.messages.push(result.replacementMessage);
          await context.scrollToBottom();
        }

        // If should block, return early
        if (result.shouldBlock) {
          console.log(`🚫 Message filtered: ${result.reason}`);
          return result;
        }
      }
    }

    return { shouldBlock: false };
  };

  return {
    filterMessage,
    // Individual filters for testing/debugging
    filterCurrencyErrors,
    handleOrderConfirmation,
    filterBusinessSideMessages,
    handlePaymentConfirmation,
    handleAddressConfirmation,
    handleProofUpload,
  };
}
