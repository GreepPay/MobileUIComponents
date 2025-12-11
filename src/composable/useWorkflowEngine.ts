import { reactive, ref, computed } from "vue";
import { Logic } from "./";
import { useMessageFiltering } from "./useMessageFiltering";
import {
  calculateDeliveryCost,
  getAreaKeyFromValue,
} from "../utils/cyprusRoutePricing";
import { availableCurrencies } from ".";
import { last } from "lodash";
import {
  DeliveryAddress,
  ExchangeAd,
  Participant,
} from "@greep/logic/src/gql/graphql";

export interface WorkflowMessage {
  id: string;
  content: string;
  text_content: string;
  user_uuid: string;
  user_name: string;
  type: "text" | "info";
  isUser: boolean;
  timestamp: Date;
  metadata?: {
    type: "text" | "options" | "info";
    options?: Array<{
      value: string;
      content: string;
      type?: string;
      message?: any;
    }>;
    extras?: {
      input_placeholder?: string;
      input_name?: string;
      info_icon?: string;
      [key: string]: any;
    };
  };
  actions?: Array<{
    label: string;
    value: string;
    type: "success" | "info" | "danger" | "warning" | "primary";
    message: string;
    disabled?: boolean;
    handler: () => void;
  }>;
  sender?: {
    uuid: string;
    name: string;
  };
  // Optional properties for ChatMessage component
  info_icon?: string;
  media?: {
    type: "image";
    url: string;
  };
  isOrderSummary?: boolean;
  orderSummary?: {
    youSell: string;
    youGet: string;
    fee: string;
    deliveryFee: string;
    youPay: string;
    paymentType: string;
    payoutOption: string;
    deliveryAddress: string;
  } | null;
}

// Configuration interfaces
export interface WorkflowEngineOptions {
  conversationId: number;
  workflowType: "p2p_withdrawal" | "deliveries" | "p2p_deposit";
  enableDirectMessaging?: boolean;
}

const detectBusinessUser = (conversationData?: any) => {};

export interface WorkflowEngineOptions {
  conversationId: number;
  workflowType: "p2p_withdrawal" | "deliveries" | "p2p_deposit";
  enableDirectMessaging?: boolean;
}

export const useWorkflowEngine = (options: WorkflowEngineOptions) => {
  // State
  const messages = reactive<WorkflowMessage[]>([]);
  const isProcessing = ref(false);
  const currentStage = ref("");
  const isConnected = ref(false);
  const conversationId = ref(options.conversationId);
  const currentWorkflow = ref<any>(null);
  const isBusinessUser = ref(false);
  const businessJoined = ref(false);
  const businessUserInfo = ref<any>(null);
  const businessName = ref<string>(""); // Store business name for header display
  const directMessagingEnabled = ref(options.enableDirectMessaging || false);
  const manualModalOverride = ref<string | null>(null);
  const showProofUpload = ref(false);

  const countdownType = ref<string | null>(null);
  const countdownTime = ref(0);
  const countdownInterval = ref<NodeJS.Timeout | null>(null);
  const orderCreated = ref(false);
  const deliveryCompleted = ref(false);
  const currentOrderId = ref<string | null>(null);
  const currentOrderUuid = ref<string | null>(null); // Store current order UUID

  // Message filtering state
  const orderConfirmed = ref(false);
  const showAddressInput = ref(false);
  const proofUploaded = ref(false);
  const showPaymentConfirmation = ref(false);

  // Scroll function placeholder
  const scrollToBottom = async () => {
    // This will be implemented by the consuming component
    await new Promise((resolve) => setTimeout(resolve, 100));
  };

  const startCountdown = (type: string, seconds: number) => {
    console.log(`🕐 Starting ${type} countdown for ${seconds} seconds`);
    countdownType.value = type;
    countdownTime.value = seconds;

    if (countdownInterval.value) {
      clearInterval(countdownInterval.value);
    }

    countdownInterval.value = setInterval(() => {
      countdownTime.value--;

      if (countdownTime.value <= 0) {
        stopCountdown();
        handleCountdownExpired();
      }
    }, 1000);
  };

  const stopCountdown = () => {
    console.log("⏹️ Stopping countdown");
    if (countdownInterval.value) {
      clearInterval(countdownInterval.value);
      countdownInterval.value = null;
    }
    countdownType.value = null;
    countdownTime.value = 0;
  };

  const handleCountdownExpired = () => {
    const type = countdownType.value;

    if (type === "waiting_business") {
      const timeoutMessage: WorkflowMessage = {
        id: `timeout_${Date.now()}`,
        content:
          "⏰ Time's up! The business didn't respond within 10 minutes. Your order has been cancelled.",
        text_content:
          "⏰ Time's up! The business didn't respond within 10 minutes. Your order has been cancelled.",
        user_uuid: "greep_ai",
        user_name: "GreepPay AI",
        type: "text",
        isUser: false,
        timestamp: new Date(),
        sender: { uuid: "greep_ai", name: "GreepPay AI" },
      };
      addMessage(timeoutMessage);
    }
  };

  const getCurrencyInfo = () => {
    const conversationData = Logic.Messaging.SingleConversation;
    const exchangeAd = conversationData?.exchangeAd;
    const exchangeRate = exchangeAd?.rate || 10;
    const allCurrenciesInAd = [];

    allCurrenciesInAd.push(exchangeAd?.from_currency, exchangeAd?.to_currency);

    const nonUsdcCurrency = allCurrenciesInAd?.filter(
      (item) => item != "USDC"
    )?.[0];

    const currencyInfo = availableCurrencies.find(
      (item) => item.code == nonUsdcCurrency
    );

    return currencyInfo;
  };

  const buildStructuredResponse = (
    content: string,
    lastAIMessage?: WorkflowMessage,
    metadata: { [key: string]: any } = {}
  ) => {
    const aiExtras = lastAIMessage?.metadata?.extras || {};

    const inputType = aiExtras.input_type;
    const inputName = aiExtras.input_name;

    // Check if content is a number (withdrawal amount) - but not for option selections
    const amount = parseFloat(content.replace(/,/g, ""));

    const conversationData = Logic.Messaging.SingleConversation;
    const exchangeAd = conversationData?.exchangeAd;

    let structuredResponse = {};

    if (amount) {
      const exchangeRate = exchangeAd?.rate || 10;
      const sellAmount = amount * exchangeRate;
      const buyAmount = amount;
      const buyAmountUSD = amount / exchangeRate;

      structuredResponse = {
        currency: "USDC",
        amount: amount,
        currency_symbol: getCurrencyInfo()?.symbol || "₺",
        business_name: exchangeAd?.business?.business_name || "GreepPay",
        sell_amount: Logic.Common.convertToMoney(
          sellAmount.toFixed(2),
          true,
          ""
        ),
        usd_amount: buyAmountUSD.toFixed(2),
        usd_amount_formatted: Logic.Common.convertToMoney(
          buyAmountUSD.toFixed(2),
          true,
          ""
        ),
        buy_amount: Logic.Common.convertToMoney(buyAmount.toFixed(2), true, ""),
        sell_rate: Logic.Common.convertToMoney(
          exchangeRate.toFixed(2),
          true,
          ""
        ),
        buy_rate: Logic.Common.convertToMoney(
          exchangeRate.toFixed(2),
          true,
          ""
        ),
        ...metadata,
        [inputName || "message"]: content,
      };
    } else {
      structuredResponse = {
        ...metadata,
        [inputName || "message"]: content,
      };
    }

    let otherData: any = {};

    switch (inputType) {
      case "numeric":
        otherData = {
          [inputName || "amount"]: parseFloat(content),
          selected_option: "string", // MessageBroadcaster expects this key
        };

      case "text":
        // Special handling for delivery_note input
        if (inputName === "delivery_note") {
          otherData = {
            [inputName]: content,
            delivery_note_data_type: "string", // Required for delivery note workflow
          };
        }
        otherData = {
          [inputName || "item_description"]: content,
          selected_option: "string", // MessageBroadcaster expects this key
        };

      case "address":
        otherData = {
          [inputName || "address"]: content,
          selected_option: "string", // MessageBroadcaster expects this key
        };

      case "bank_account":
        otherData = {
          [inputName || "bank_account"]: content,
          selected_option: "string", // MessageBroadcaster expects this key
        };

      case "pickup_location":
        otherData = {
          [inputName || "pickup_location"]: content,
          selected_option: "string", // MessageBroadcaster expects this key
        };

      case "datetime":
        otherData = {
          [inputName || "delivery_datetime"]: content,
          selected_option: "string", // MessageBroadcaster expects this key
        };

      default:
        if (lastAIMessage?.metadata?.type === "options") {
          otherData = {
            selected_option: metadata?.selected_option || content,
          };
        }

        // If metadata has selected_option, use it (for action button clicks)
        if (metadata?.selected_option) {
          otherData = {
            selected_option: metadata.selected_option,
          };
        }

        otherData = {
          message: content,
        };
    }

    structuredResponse = {
      ...structuredResponse,
      ...otherData,
    };

    return structuredResponse;
  };

  // Get the last AI message to determine expected input
  const getLastAIMessage = () => {
    const aiMessages = messages.filter(
      (msg) =>
        msg.user_uuid == "greep_ai" ||
        msg.user_uuid == "greep-ai" ||
        msg.user_uuid == "user"
    );

    return aiMessages[aiMessages.length - 1];
  };

  const getChatMetadata = () => {
    let messagesMetadata = {};

    messages?.forEach((message) => {
      const metadata: any = message.metadata;

      messagesMetadata = {
        ...messagesMetadata,
        ...metadata,
        ...(metadata?.structured_response || {}),
      };
    });

    return messagesMetadata;
  };

  const fillUpMessageTemplate = (message: string) => {
    let messagesMetadata = getChatMetadata();

    //  replace {value} template with actual values from metadata
    let filledMessage = message;
    for (const key in messagesMetadata) {
      filledMessage = filledMessage.replace(`{${key}}`, messagesMetadata[key]);
    }
    return filledMessage;
  };

  // Convert backend message to display format
  const convertToDisplayMessage = (backendMessage: any): WorkflowMessage => {
    const metadata = backendMessage.metadata
      ? typeof backendMessage.metadata === "string"
        ? JSON.parse(backendMessage.metadata)
        : backendMessage.metadata
      : {};

    const actions =
      metadata.options?.map((option: any) => ({
        label: option.content,
        value: option.value,
        type: option.type || "primary",
        message: option.message?.content || option.content,
        disabled:
          isProcessing.value ||
          (option.value === "confirm" && orderCreated.value),
        handler: () => {
          // Skip if disabled or processing
          if (
            isProcessing.value ||
            (option.value === "confirm" && orderCreated.value)
          ) {
            console.log(
              "⏭️ Button click ignored - disabled or order already created"
            );
            return;
          }

          // Use the actual action handler with debouncing
          handleActionClick({
            message: option.message?.content || option.content,
            label: option.content,
            value: option.value,
            type: option.type || "primary",
          });
        },
      })) || [];

    // ✅ FIXED: Better AI message detection like backup
    const messageMetadata =
      typeof backendMessage.metadata === "string"
        ? JSON.parse(backendMessage.metadata)
        : backendMessage.metadata || {};

    // Determine if this is an AI message or user message - use backup logic
    const isAIMessage =
      backendMessage.user_id === 0 ||
      backendMessage.sender?.uuid === "greep_ai" ||
      backendMessage.user_uuid === "greep_ai" ||
      messageMetadata.sender_type === "system" ||
      messageMetadata.is_system_message ||
      (!backendMessage.sender && backendMessage.user_id === 0); // Only if both conditions are true

    // ✅ ENHANCED: Better sender detection using WebSocket message data first
    let userName = "User";
    let userUuid = "user";
    let isUserMessage = false; // Whether this message is from the current user

    if (isAIMessage) {
      userName = "GreepPay AI";
      userUuid = "greep_ai";
      isUserMessage = false;
    } else {
      // For real user messages, prioritize WebSocket message data over auth user
      const currentUserId = parseInt(Logic.Auth.AuthUser?.id || "0");
      const messageUserId = backendMessage.user_id;

      // First, try to get user info directly from the WebSocket message
      if (backendMessage.sender) {
        userName =
          backendMessage.sender.name ||
          `${backendMessage.sender.first_name || ""} ${
            backendMessage.sender.last_name || ""
          }`.trim();
        userUuid =
          backendMessage.sender.uuid || backendMessage.user_uuid || "user";

        if (!userName || userName.trim() === "") {
          userName = backendMessage.user_name || "GreepPay AI";
        }
      } else if (
        backendMessage.user_name &&
        backendMessage.user_name !== "GreepPay AI"
      ) {
        userName = backendMessage.user_name;
        userUuid = backendMessage.user_uuid || "user";
      }

      // ✅ CRITICAL: Determine if this is current user's message
      if (messageUserId === currentUserId) {
        // This is current user's message
        isUserMessage = true;
        console.log("👤 CURRENT USER MESSAGE detected:", {
          messageUserId,
          currentUserId,
          userName,
          content: backendMessage.content?.substring(0, 30),
        });
        if (!userName || userName === "User") {
          userName = Logic.Auth.AuthUser?.first_name || "You";
          userUuid = Logic.Auth.AuthUser?.uuid || "user";
        }
      } else if (messageUserId && messageUserId !== 0) {
        // This is from another user (business partner)
        isUserMessage = false;
        console.log("👥 BUSINESS USER MESSAGE detected:", {
          messageUserId,
          currentUserId,
          userName,
          content: backendMessage.content?.substring(0, 30),
        });
        if (!userName || userName === "User") {
          const conversation = Logic.Messaging?.SingleConversation;
          if (conversation?.participants) {
            const sender = conversation.participants.find(
              (p: any) => p.user_id === messageUserId
            );
            if (sender) {
              userName =
                (sender as any).name ||
                `${(sender as any).first_name || ""} ${
                  (sender as any).last_name || ""
                }`.trim() ||
                "Other User";
              userUuid = (sender as any).uuid || "other_user";
            } else {
              // Check business user info from recent joins
              const joinedBusinessUser = businessUserInfo.value;
              if (
                joinedBusinessUser &&
                (joinedBusinessUser.id === messageUserId ||
                  joinedBusinessUser.user_id === messageUserId)
              ) {
                userName =
                  joinedBusinessUser.first_name && joinedBusinessUser.last_name
                    ? `${joinedBusinessUser.first_name} ${joinedBusinessUser.last_name}`
                    : joinedBusinessUser.name ||
                      joinedBusinessUser.user_name ||
                      "Business User";
                userUuid = joinedBusinessUser.uuid || "business_user";
              }
            }
          }
        }
      } else {
        // No user_id or user_id is 0 - likely a template message, treat as not current user
        isUserMessage = false;
      }
    }

    console.log("🔧 Message sender detection:", {
      messageUserId: backendMessage.user_id,
      currentUserId: Logic.Auth.AuthUser?.id,
      isAIMessage,
      isUserMessage,
      resolvedUserName: userName,
      senderData: backendMessage.sender,
    });

    // Determine message type - ChatMessage component only supports "text" and "info"
    // Backend might send "options" type, but we should use "text" for messages with actions
    let messageType = metadata?.type || "text";

    // Convert backend message types to component-compatible types
    if (
      messageType === "chat_message" ||
      messageType === "structured_response"
    ) {
      messageType = "text"; // Regular chat messages should be rendered as text
    }
    if (messageType === "options" || actions.length > 0) {
      messageType = "text"; // ChatMessage component handles actions within text messages
    }

    // ✅ Process templates in content
    let processedContent =
      backendMessage.content || backendMessage.text_content || "";

    processedContent = fillUpMessageTemplate(processedContent);

    let isOrderSummary = false;
    let orderSummaryData = null;

    // Handle {order_summary_text} template - create order summary object
    if (processedContent.includes("{order_summary_text}")) {
      isOrderSummary = true;
      orderSummaryData = extractOrderSummary();

      // Set a simple placeholder content since the ChatMessage will render the order summary UI
      processedContent = "Order Summary";
    }

    // ✅ Handle delivery cost template replacement (hard-coded for now)
    if (processedContent.includes("${delivery_cost}")) {
      // Use a standard delivery cost since weight is removed from the flow
      let deliveryCost = 8; // Standard delivery cost

      processedContent = processedContent.replace(
        /\$\{delivery_cost\}/g,
        deliveryCost.toString()
      );

      console.log("💰 DELIVERY COST REPLACED", {
        originalContent: backendMessage.content,
        processedContent,
        deliveryCost,
      });
    }

    const finalMessage = {
      id:
        backendMessage.uuid ||
        backendMessage.id ||
        `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      content: processedContent,
      // Add properties that ChatMessage component expects
      text_content: processedContent,
      user_uuid: userUuid,
      user_name: userName,
      type: messageType,
      info_icon: metadata?.extras?.info_icon || metadata?.info_icon || "",
      isUser: isUserMessage, // ✅ Use the correctly calculated isUserMessage
      timestamp: new Date(backendMessage.createdAt || Date.now()),
      metadata,
      actions,
      isOrderSummary,
      orderSummary: orderSummaryData,
      sender: {
        uuid: userUuid,
        name: userName,
      },
    };

    console.log("🏗️ FINAL MESSAGE OBJECT:", {
      id: finalMessage.id,
      content: finalMessage.content.substring(0, 30) + "...",
      userName: finalMessage.user_name,
      isUser: finalMessage.isUser,
      messageUserId: backendMessage.user_id,
      currentUserId: Logic.Auth.AuthUser?.id,
    });

    return finalMessage;
  };

  // Add message to display
  const addMessage = (message: WorkflowMessage | any) => {
    let displayMessage: WorkflowMessage;

    if ("isUser" in message) {
      displayMessage = message as WorkflowMessage;
    } else {
      displayMessage = convertToDisplayMessage(message);
    }

    // Prevent duplicates
    const existingIndex = messages.findIndex((m) => m.id === displayMessage.id);
    if (existingIndex >= 0) {
      console.log("🔄 Updating existing message:", displayMessage.id);
      console.log("🔧 Existing message being replaced:", {
        id: messages[existingIndex].id,
        content: messages[existingIndex].content,
        user_name: messages[existingIndex].user_name,
      });
      messages[existingIndex] = displayMessage;
    } else {
      console.log("➕ Adding new message:", {
        id: displayMessage.id,
        content: displayMessage.content,
        isUser: displayMessage.isUser,
        user_name: displayMessage.user_name,
      });
      messages.push(displayMessage);
    }

    console.log("📊 Total messages after add:", messages.length);
  };

  // Business user detection and management
  const detectBusinessUser = (conversationData?: any) => {
    if (!conversationData?.participants || !Logic.Auth.AuthUser?.id) {
      return false;
    }

    const currentUserId = parseInt(Logic.Auth.AuthUser.id);
    const participants = conversationData.participants;

    if (participants.length <= 1) {
      return false;
    }

    // Check if current user is a participant
    const isParticipant = participants.some(
      (p: any) => p.user_id === currentUserId
    );

    // Check if current user is the owner (conversation creator)
    let isOwner = false;

    // Method 1: Check if owner_id matches current user
    if (conversationData.owner_id) {
      isOwner = conversationData.owner_id === currentUserId;
    }
    // Method 2: If owner_id is undefined, check if this is the first participant (likely the creator)
    else if (participants.length > 0) {
      // Sort participants by ID to get the first one (likely the creator)
      const sortedParticipants = [...participants].sort(
        (a: any, b: any) => a.id - b.id
      );
      isOwner = sortedParticipants[0].user_id === currentUserId;
    }

    // Business user is a participant who is not the owner AND there are multiple participants
    const isBusiness = isParticipant && !isOwner && participants.length > 1;

    return isBusiness;
  };

  // Handle business user joining conversation
  const handleBusinessJoined = (businessUserData: any) => {
    console.log("🎉 BUSINESS JOINED EVENT:", businessUserData);
    console.log("📊 Messages BEFORE business join:", messages.length);
    console.log(
      "🔍 Current messages BEFORE business join:",
      messages.map((m: any) => ({
        id: m.id,
        content: m.content.substring(0, 50) + "...",
        isUser: m.sender?.uuid != "user",
        user_name: m.user_name,
      }))
    );

    // ✅ NEW: Store business user data for later use in message sender resolution
    businessUserInfo.value = businessUserData;

    // ✅ CRITICAL: Stop countdown timer first
    stopCountdown();

    businessJoined.value = true;
    directMessagingEnabled.value = true;

    const extractedBusinessName =
      businessUserData.first_name && businessUserData.last_name
        ? `${businessUserData.first_name} ${businessUserData.last_name}`
        : businessUserData.name ||
          businessUserData.user_name ||
          "Delivery Partner";

    // Store business name for header display
    businessName.value = extractedBusinessName;

    // ✅ SIMPLE: Add business joined message directly like delivery chat
    const businessJoinedMessage: WorkflowMessage = {
      id: `business_joined_${Date.now()}`,
      content: `✅ ${extractedBusinessName} has joined the conversation!`,
      text_content: `✅ ${extractedBusinessName} has joined the conversation!`,
      user_uuid: "greep_ai",
      user_name: "GreepPay AI",
      type: "info" as const,
      info_icon: "business-info",
      isUser: false,
      timestamp: new Date(),
      sender: {
        uuid: "greep_ai",
        name: "GreepPay AI",
      },
      metadata: {
        type: "info",
        extras: {
          info_icon: "business-info",
          business_joined: true,
        },
      },
    };

    console.log("➕ Adding business joined message:", businessJoinedMessage);
    // ✅ SIMPLE: Add message directly to array like delivery chat
    messages.push(businessJoinedMessage);
    console.log(
      "✅ Business joined message added, total messages:",
      messages.length
    );
    console.log("📊 Messages AFTER business join:", messages.length);
    console.log(
      "🔍 Current messages AFTER business join:",
      messages.map((m: any) => ({
        id: m.id,
        content: m.content.substring(0, 50) + "...",
        isUser: m.sender?.uuid != "user",
        user_name: m.user_name,
      }))
    );

    // Note: Order summary already exists from order creation, no need to create another one
  }; // Send direct message (bypassing workflow for business users)
  const sendDirectMessage = async (content: string): Promise<boolean> => {
    if (!content.trim() || isProcessing.value) return false;

    try {
      isProcessing.value = true;

      // Add user message to display immediately
      const userMessage: WorkflowMessage = {
        id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        content,
        text_content: content,
        user_uuid: Logic.Auth.AuthUser?.uuid || "user",
        user_name: Logic.Auth.AuthUser?.first_name || "You",
        type: "text" as const,
        isUser: false,
        timestamp: new Date(),
        sender: {
          uuid: Logic.Auth.AuthUser?.uuid || "user",
          name: Logic.Auth.AuthUser?.first_name || "You",
        },
      };
      addMessage(userMessage);

      // Send as regular message without structured response
      Logic.Messaging.CreateMessageForm = {
        input: {
          conversation_id: conversationId.value,
          content: content,
          type: "text",
          sender_id: parseInt(Logic.Auth.AuthUser?.id?.toString() || "0"),
          metadata: JSON.stringify({
            sender_type: isBusinessUser.value ? "business" : "user",
            is_direct_message: true,
            conversation_type: options.workflowType,
          }),
        },
      };

      await Logic.Messaging.CreateMessage();
      return true;
    } catch (error) {
      console.error("❌ Error sending direct message:", error);
      return false;
    } finally {
      isProcessing.value = false;
    }
  };

  // Send regular chat message (bypassing workflow with chat_message metadata)
  const sendRegularChatMessage = async (
    content: string,
    metadata?: any
  ): Promise<boolean> => {
    if (!content.trim() || isProcessing.value) return false;

    try {
      isProcessing.value = true;

      // Add user message to display immediately with temporary ID
      const tempId = `temp_${Date.now()}_${Math.random()
        .toString(36)
        .substr(2, 9)}`;

      // ✅ Create user message that will be replaced by WebSocket message
      // Use minimal user data since WebSocket will provide the real message
      const userMessage: WorkflowMessage = {
        id: tempId,
        content,
        text_content: content,
        user_uuid: Logic.Auth.AuthUser?.uuid || "user",
        user_name: Logic.Auth.AuthUser?.first_name || "You",
        type: "text" as const,
        isUser: true,
        timestamp: new Date(),
        sender: {
          uuid: Logic.Auth.AuthUser?.uuid || "user",
          name: Logic.Auth.AuthUser?.first_name || "You",
        },
        metadata: {
          ...(metadata || {}),
        },
      };

      addMessage(userMessage);

      // Send as regular chat message with chat_message metadata type
      Logic.Messaging.CreateMessageForm = {
        input: {
          conversation_id: conversationId.value,
          content: content,
          type: "text",
          sender_id: parseInt(Logic.Auth.AuthUser?.id?.toString() || "0"),
          metadata: JSON.stringify({
            type: "chat_message",
            sender_type: isBusinessUser.value ? "business" : "user",
            sender_name: Logic.Auth.AuthUser?.first_name || "GreepPay AI",
            sender_uuid: Logic.Auth.AuthUser?.uuid,
            is_regular_chat: true,
            conversation_type: options.workflowType,
            ...(metadata || {}),
          }),
        },
      };

      await Logic.Messaging.CreateMessage();
      return true;
    } catch (error) {
      console.error("❌ Error sending regular chat message:", error);
      return false;
    } finally {
      isProcessing.value = false;
    }
  };

  const handleProofUploadComplete = async (files: File[]) => {
    showProofUpload.value = false;

    try {
      // Add proof uploaded message
      const proofMessage: WorkflowMessage = {
        id: `proof_uploaded_${Date.now()}`,
        content: `Payment proof uploaded successfully! Business partner`,
        text_content: `Payment proof uploaded successfully! Business partner`,
        user_uuid: "greep_ai",
        user_name: "GreepPay AI",
        type: "info",
        info_icon: "upload-success",
        isUser: false,
        timestamp: new Date(),
        isOrderSummary: false,
        orderSummary: null,
        sender: {
          uuid: "greep_ai",
          name: "GreepPay AI",
        },
      };

      messages.push(proofMessage);
    } catch (error) {
      console.error("❌ Error processing proof upload:", error);
    }
  };

  // Extract order summary from conversation context
  const extractOrderSummary = () => {
    // Get exchange ad data for order details
    const conversationData = Logic.Messaging.SingleConversation;
    const exchangeAd = conversationData?.exchangeAd;
    const entityType = conversationData?.entity_type;

    const summary: any = {
      amount: null,
      currency: "USDC",
      currency_symbol: getCurrencyInfo()?.symbol || "₺",
      method: null,
      address: null,
      pickup_location: null,
      business_name: exchangeAd?.business?.business_name || "GreepPay",
      sell_rate: exchangeAd?.rate || 10,
      status: "pending",
    };

    // ✅ ENHANCED: Try to get order data from conversation metadata first
    try {
      const conversationMetadata = conversationData?.metadata
        ? typeof conversationData.metadata === "string"
          ? JSON.parse(conversationData.metadata)
          : conversationData.metadata
        : {};

      const chatMetaData: any = getChatMetadata();

      summary.currency_symbol =
        chatMetaData.currency_symbol || summary.currency_symbol;
      summary.amount = chatMetaData.amount || summary.sell_rate;

      // Check if there's order data in metadata
      if (conversationMetadata.order_data) {
        const orderData = conversationMetadata.order_data;
        summary.amount = orderData.amount;
        summary.method = orderData.payment_type;
        summary.address = orderData.delivery_address;
        summary.pickup_location = orderData.delivery_address;
        console.log("📋 Found order data in conversation metadata:", orderData);
      }
    } catch (e) {
      console.log("⚠️ Could not parse conversation metadata for order data");
    }

    // ✅ BETTER: Look for amount in conversation metadata first
    let incomingAmount = null;
    try {
      // Check if amount is in conversation metadata or URL params
      const urlParams = new URLSearchParams(window.location.search);
      const amountParam = urlParams.get("amount");
      if (amountParam) {
        incomingAmount = parseFloat(amountParam);
      }
    } catch (e) {
      // Ignore URL parsing errors
    }

    if (incomingAmount && incomingAmount > 0) {
      summary.amount = incomingAmount;
    } else if (!summary.amount) {
      // ✅ FALLBACK: Only look for simple numeric user messages (avoiding metadata numbers)
      const userMessages = messages.filter(
        (message) => message?.sender?.uuid != "user"
      );
      for (const msg of userMessages) {
        // Only consider short numeric messages (likely amount inputs)
        if (
          msg.content.length <= 10 &&
          /^\d+(\.\d+)?$/.test(msg.content.trim())
        ) {
          const amount = parseFloat(msg.content.trim());
          if (amount > 0 && amount < 10000) {
            // Reasonable amount range
            summary.amount = amount;
            console.log("🔍 Found amount from user message:", amount);
            break;
          }
        }
      }
    }

    // Calculate sell amount
    if (summary.amount) {
      summary.sell_amount = Logic.Common.convertToMoney(
        (summary.amount * summary.sell_rate).toFixed(2),
        true,
        ""
      );
    }

    // ✅ BETTER: Extract method from the last method selection or metadata
    if (!summary.method) {
      const userMessages = messages.filter(
        (message) => message?.sender?.uuid != "user"
      );
      userMessages.reverse(); // Check latest messages first

      userMessages.forEach((msg) => {
        const content = msg.content.toLowerCase();
        if (content.includes("pickup") || content === "cash") {
          summary.method = "cash_pickup";
        } else if (content.includes("delivery")) {
          summary.method = "cash_delivery";
        } else if (content.includes("bank")) {
          summary.method = "bank_transfer";
        }
      });
    }

    // Extract other details from messages if not in metadata
    const userMessages = messages.filter(
      (message) => message?.sender?.uuid != "user"
    );

    // Extract address for delivery
    if (!summary.address) {
      userMessages.forEach((msg) => {
        if (
          msg.content.length > 20 &&
          (msg.content.includes(",") ||
            msg.content.toLowerCase().includes("street"))
        ) {
          summary.address = msg.content;
        }
      });
    }

    // Extract pickup location
    if (!summary.pickup_location) {
      userMessages.forEach((msg) => {
        if (msg.content.toLowerCase().includes("pickup:")) {
          summary.pickup_location = msg.content.replace(/pickup:\s*/i, "");
        }
      });
    }

    // ✅ Extract bank account details
    userMessages.forEach((msg) => {
      if (msg.content.toLowerCase().includes("bank:")) {
        summary.bank_account = msg.content.replace(/bank:\s*/i, "");
      }
    });

    // ✅ Return the exact format ChatMessage component expects
    if (summary.amount && summary.method) {
      // ✅ FIX: Calculate delivery fee based on method
      const deliveryFee = summary.method === "cash_delivery" ? 3 : 0;
      let totalAmount = summary.amount + deliveryFee;

      const entityType = Logic.Messaging.SingleConversation?.entity_type || "";

      if (entityType === "p2p_deposit") {
        const chatMetadata: any = getChatMetadata();

        return {
          youSell: `${chatMetadata.currency_symbol || ""}${
            chatMetadata.buy_amount
          }`,
          youGet: `${chatMetadata.usd_amount_formatted} USDC`,
          fee: "0 USDC",
          deliveryFee: `${deliveryFee} USDC`,
          youPay: `${chatMetadata.currency_symbol || ""}${
            chatMetadata.buy_amount
          }`,
          paymentType: "Online Payment",
          payoutOption: "",
          deliveryAddress: "",
        };
      }

      const chatMetaData: any = getChatMetadata();
      if (entityType === "p2p_withdrawal" && chatMetaData.amount) {
        summary.amount = chatMetaData.amount;
        summary.sell_amount = chatMetaData.sell_amount;
        summary.currency_symbol = chatMetaData.currency_symbol;
        totalAmount = chatMetaData.amount;
      }

      return {
        youSell: `${summary.amount} USDC`,
        youGet: `${summary.currency_symbol}${summary.sell_amount}`,
        fee: "0 USDC",
        deliveryFee: `${deliveryFee} USDC`,
        youPay: `${totalAmount} USDC`,
        paymentType: "USDC",
        payoutOption:
          summary.method === "cash_pickup"
            ? "Pickup"
            : summary.method === "cash_delivery"
            ? "Delivery"
            : "Online Payment",
        deliveryAddress:
          summary.method === "cash_pickup"
            ? summary.pickup_location
            : summary.method === "cash_delivery"
            ? summary.address
            : summary.bank_account || "Bank account details",
      };
    }

    return null;
  };

  // Format order summary for display
  const formatOrderSummary = (summary: any): string => {
    let formatted = "";

    // Amount section
    if (summary.amount) {
      formatted += `💰 **You Sell:** ${summary.amount} ${
        summary.currency || "USDC"
      }\n`;

      if (summary.sell_amount) {
        formatted += `💵 **You Get:** ${summary.currency_symbol}${summary.sell_amount}\n`;
      }

      if (summary.sell_rate) {
        formatted += `📊 **Rate:** ${summary.currency_symbol}${
          summary.sell_rate
        } per 1 ${summary.currency || "USDC"}\n`;
      }

      formatted += "\n";
    }

    // Method section
    if (summary.method) {
      const methodName = summary.method
        .replace("_", " ")
        .replace(/\b\w/g, (l: string) => l.toUpperCase());
      formatted += `🏦 **Payment Method:** ${methodName}\n`;
    }

    // Location/Address section
    if (summary.method === "cash_pickup" && summary.pickup_location) {
      formatted += `📍 **Pickup Location:** ${summary.pickup_location}\n`;
    } else if (summary.method === "cash_delivery" && summary.address) {
      formatted += `📍 **Delivery Address:** ${summary.address}\n`;
    }

    // Business info
    if (summary.business_name) {
      formatted += `🏢 **Merchant:** ${summary.business_name}\n`;
    }

    // Fees (if any)
    formatted += `💸 **Fee:** ₺0.00\n`;

    formatted += "\n*Please review your order details before confirming.*";

    return formatted;
  };

  // Enhanced send message that supports both workflow and direct messaging
  const sendMessage = async (
    content: string,
    metadata?: any,
    forceDirect = false,
    forceWorkflow = false
  ): Promise<boolean> => {
    if (!content.trim() || isProcessing.value) return false;

    const workflowType = Logic.Messaging.SingleConversation?.entity_type || "";

    // ✅ NEW: If business has joined, use regular chat messaging

    if (
      (businessJoined.value || directMessagingEnabled.value || forceDirect) &&
      !forceWorkflow
    ) {
      console.log("🔧 Using sendRegularChatMessage");
      return sendRegularChatMessage(content, metadata);
    }

    // ✅ DEFAULT: Use workflow message for regular flow
    console.log("🔧 Using sendWorkflowMessage");
    return sendWorkflowMessage(content, metadata);
  };

  // ✅ NEW: Accumulate delivery order data as we progress through the workflow
  const accumulateDeliveryData = (
    content: string,
    lastAIMessage?: WorkflowMessage
  ) => {
    const conversationData = Logic.Messaging.SingleConversation;
    let existingDeliveryData: any = {};

    // Get existing delivery data from conversation metadata
    try {
      const metadata = conversationData?.metadata
        ? typeof conversationData.metadata === "string"
          ? JSON.parse(conversationData.metadata)
          : conversationData.metadata
        : {};
      existingDeliveryData = metadata.deliveryOrderData || {};
    } catch (e) {
      console.warn("⚠️ Could not parse existing delivery data from metadata");
    }

    const newData: any = { ...existingDeliveryData };
    const aiContent = lastAIMessage?.content?.toLowerCase() || "";

    // Determine what data we're collecting based on the AI question
    if (aiContent.includes("item") && aiContent.includes("sending")) {
      // Item description question
      if (
        content.length > 2 &&
        !["now", "yes", "no", "1", "2", "skip"].includes(content.toLowerCase())
      ) {
        newData.itemDescription = content;
        newData.item_description = content;
      }
    } else if (aiContent.includes("when") && aiContent.includes("deliver")) {
      // Timing question
      if (
        ["now", "instant", "today", "tomorrow", "later"].includes(
          content.toLowerCase()
        )
      ) {
        newData.timing =
          content.toLowerCase() === "now" ? "Instant" : "Scheduled";
        newData.urgency =
          content.toLowerCase() === "now" ? "IMMEDIATE" : "NORMAL";
        newData.selectedTiming = content;
      }
    } else if (aiContent.includes("pickup") && aiContent.includes("address")) {
      // Pickup address question
      if (content.length > 5) {
        newData.pickupAddress = content;
        newData.pickup_address = content;
      }
    } else if (
      aiContent.includes("delivery") &&
      aiContent.includes("address")
    ) {
      // Delivery address question
      if (content.length > 5) {
        newData.deliveryAddress = content;
        newData.delivery_address = content;
      }
    } else if (
      aiContent.includes("note") ||
      (aiContent.includes("detail") && aiContent.includes("pickup"))
    ) {
      // Delivery note question
      if (content.toLowerCase() !== "skip") {
        newData.deliveryNote = content;
        newData.note = content;
      }
    } else if (aiContent.includes("bill") && aiContent.includes("₦")) {
      // Price acceptance - extract price from AI message
      const priceMatch = aiContent.match(/₦(\d+)/);
      if (priceMatch && content.toLowerCase() === "accept") {
        newData.deliveryPrice = parseInt(priceMatch[1]);
        newData.price = parseInt(priceMatch[1]);
        newData.priceAccepted = true;
      }
    }

    console.log("📝 Accumulated delivery data:", newData);
    return newData;
  };

  // Original workflow message sending (renamed)
  const sendWorkflowMessage = async (
    content: string,
    metadata?: any
  ): Promise<boolean> => {
    if (!content.trim() || isProcessing.value) return false;

    try {
      isProcessing.value = true;

      // Build structured response based on last AI message requirements
      const lastAI = getLastAIMessage();
      const structuredResponse = buildStructuredResponse(
        content,
        lastAI,
        metadata
      );

      // ✅ NEW: Accumulate delivery order data in conversation metadata
      let deliveryOrderData = {};
      if (options.workflowType === "deliveries") {
        deliveryOrderData = accumulateDeliveryData(content, lastAI);

        // Save accumulated data to conversation metadata for persistence
        try {
          const conversationData = Logic.Messaging.SingleConversation;
          if (conversationData) {
            let existingMetadata = {};
            if (conversationData.metadata) {
              existingMetadata =
                typeof conversationData.metadata === "string"
                  ? JSON.parse(conversationData.metadata)
                  : conversationData.metadata;
            }

            // Update the conversation metadata with accumulated delivery data
            const updatedMetadata = {
              ...existingMetadata,
              deliveryOrderData: {
                ...(existingMetadata as any).deliveryOrderData,
                ...deliveryOrderData,
              },
            };

            // Save back to conversation (this persists the data)
            conversationData.metadata = JSON.stringify(updatedMetadata);
            console.log(
              "💾 Saved delivery data to conversation metadata:",
              updatedMetadata.deliveryOrderData
            );
          }
        } catch (e) {
          console.warn(
            "⚠️ Could not save delivery data to conversation metadata:",
            e
          );
        }
      }

      // Add user message to display immediately
      const userMessage: WorkflowMessage = {
        id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        content,
        text_content: content,
        user_uuid: Logic.Auth.AuthUser?.uuid || "user",
        user_name: Logic.Auth.AuthUser?.first_name || "You",
        type: "text" as const,
        isUser: true,
        timestamp: new Date(),
        sender: {
          uuid: Logic.Auth.AuthUser?.uuid || "user",
          name: Logic.Auth.AuthUser?.first_name || "You",
        },
        metadata: {
          ...(metadata || {}),
        },
      };
      addMessage(userMessage);

      // ✅ DEBUG: Log the complete metadata being sent to backend (like backup)
      const fullMetadata = {
        is_bot: false,
        type: "structured_response",
        sender_type: "user",
        sender_name: Logic.Auth.AuthUser?.first_name || "GreepPay AI",
        sender_uuid: Logic.Auth.AuthUser?.uuid,
        // ✅ CRITICAL: Include workflow type for backend processing
        workflow_type: options.workflowType,
        // ✅ CRITICAL: Spread structured response directly into metadata (like backup)
        ...structuredResponse,
        // ✅ CRITICAL: Also include as nested field for backward compatibility
        workflow_data: metadata,
        // ✅ NEW: Include accumulated delivery order data
        deliveryOrderData: deliveryOrderData,
        // ✅ CRITICAL: Include exchange ad directly (like backup)
        exchangeAd: Logic.Messaging.SingleConversation?.exchangeAd || null,
        // ✅ CRITICAL: Include customer information (like backup)
        customer_name:
          `${Logic.Auth.AuthUser?.first_name} ${Logic.Auth.AuthUser?.last_name}`.trim(),
        user_name: `${Logic.Auth.AuthUser?.first_name}`.trim(),
        sender: {
          first_name: Logic.Auth.AuthUser?.first_name,
          last_name: Logic.Auth.AuthUser?.last_name,
          uuid: Logic.Auth.AuthUser?.uuid,
        },
        ...(metadata || {}),
        structured_response: {
          ...structuredResponse,
        },
      };

      // Send to backend - same API as current system
      Logic.Messaging.CreateMessageForm = {
        input: {
          conversation_id: conversationId.value,
          content: content,
          type: "text",
          sender_id: parseInt(Logic.Auth.AuthUser?.id || "0"),
          metadata: JSON.stringify(fullMetadata),
        },
      };

      await Logic.Messaging.CreateMessage();
      return true;
    } catch (error) {
      console.error("❌ Error sending message:", error);
      return false;
    } finally {
      isProcessing.value = false;
    }
  };

  // Handle incoming messages from WebSocket
  const handleIncomingMessage = async (messageData: any) => {
    console.log("📨 Workflow engine received message:", messageData);

    // ✅ DEBUG: Log the metadata to understand what type of message this is
    const metadata =
      typeof messageData.metadata === "string"
        ? JSON.parse(messageData.metadata)
        : messageData.metadata || {};

    console.log("🔧 DEBUG: Message metadata:", metadata);
    console.log("🔧 DEBUG: Message type from metadata:", metadata.type);
    console.log("🔧 DEBUG: Is regular chat:", metadata.is_regular_chat);

    // ✅ IMPROVED: Better duplicate detection using multiple methods
    const messageId = messageData.uuid || messageData.id;
    const messageContent = messageData.content || messageData.text_content;
    const messageTimestamp = messageData.createdAt || messageData.created_at;

    // Check for exact UUID match first
    if (messageId) {
      const existingMessageById = messages.find(
        (m) => m.id === messageId?.toString()
      );
      if (existingMessageById) {
        console.log(
          "⏭️ Message with UUID already exists, skipping:",
          messageId
        );
        return;
      }
    }

    // ✅ NEW: Check for content + sender duplicates (for temp message replacement)
    if (messageContent && messageData.user_id) {
      const currentUserId = parseInt(Logic.Auth.AuthUser?.id || "0");
      const recentTimeWindow = 5000; // 5 seconds

      // ✅ FIXED: Only replace temp messages for current user's messages
      if (messageData.user_id === currentUserId) {
        const tempMessageIndex = messages.findIndex(
          (m) =>
            m.content === messageContent &&
            (m.id.toString().startsWith("user_") ||
              m.id.toString().startsWith("temp_")) &&
            Date.now() - m.timestamp.getTime() < recentTimeWindow
        );

        if (tempMessageIndex >= 0) {
          console.log(
            "🔄 Replacing temp message with WebSocket message:",
            messageContent
          );
          console.log(
            "  📊 Messages before temp replacement:",
            messages.length
          );
          console.log("  🗑️ Removing temp message at index:", tempMessageIndex);

          const displayMessage = convertToDisplayMessage(messageData);

          messages.splice(tempMessageIndex, 1, displayMessage);
          localStorage.setItem("messages_latest", JSON.stringify(messages));
          console.log("  ✅ Messages after temp replacement:", messages.length);

          // ✅ CRITICAL: Return here to prevent duplicate processing
          return;
        }
      }
      // ✅ NEW: For other users (business), don't try to replace temp messages
      else {
        console.log(
          "🔧 Business user message - no temp replacement needed:",
          messageContent
        );
        console.log("  👤 Business user ID:", messageData.user_id);
        console.log("  📊 Current messages count:", messages.length);
      }
    }

    // ✅ BACKUP LOGIC: Skip system/trigger messages
    if (metadata.trigger_conversation || metadata.is_system_message) {
      console.log("⏭️ Skipping system message");
      return;
    }

    // ✅ NEW: Skip order cancellation messages if order was already created successfully
    if (
      orderCreated.value &&
      messageData.content?.toLowerCase().includes("order canceled")
    ) {
      console.log("⏭️ Skipping order cancellation - order already created");
      return;
    }

    // Handle business user joining events
    if (
      messageData.type === "user_joined" ||
      messageData.event === "business_joined" ||
      messageData.event === "user.joined"
    ) {
      const userData = messageData.user || messageData.data || messageData;
      if (userData && !isBusinessUser.value) {
        console.log("🎉 Business user joined - enabling direct messaging");
        handleBusinessJoined(userData);
      }
      return;
    }

    // ✅ NEW: Handle conversation participant changes
    if (
      messageData.type === "conversation_updated" ||
      messageData.event === "conversation.participant.added"
    ) {
      const conversationData = Logic.Messaging.SingleConversation;
      if (
        conversationData?.participants &&
        conversationData.participants.length > 1
      ) {
        console.log("🔧 New participant detected - checking for business user");

        // Find the new participant (not current user)
        const currentUserId = parseInt(Logic.Auth.AuthUser?.id || "0");
        const newParticipant = conversationData.participants.find(
          (p: any) => p.user_id !== currentUserId
        );

        if (newParticipant && !businessJoined.value) {
          console.log("🎉 New business participant detected:", newParticipant);
          handleBusinessJoined(newParticipant);
        }
      }
      return;
    }

    // ✅ NEW: Business user detection based on different user ID
    if (messageData.user_id && messageData.user_id !== 0) {
      const currentUserId = parseInt(Logic.Auth.AuthUser?.id || "0");
      const messageUserId = messageData.user_id;

      // If this message is from a different user (not current user, not AI), it's from business
      if (messageUserId !== currentUserId && !businessJoined.value) {
        console.log("🎉 BUSINESS USER DETECTED via user ID mismatch!");
        console.log("  👤 Current user ID:", currentUserId);
        console.log("  📨 Message user ID:", messageUserId);
        console.log(
          "  🏪 Business user detected, triggering business joined..."
        );

        // Extract business user info from message
        const businessUserData = {
          id: messageUserId,
          user_id: messageUserId,
          name:
            messageData.sender?.name ||
            messageData.user_name ||
            "Business Partner",
          first_name: messageData.sender?.first_name || "Business",
          last_name: messageData.sender?.last_name || "Partner",
          email: messageData.sender?.email || "",
          uuid: messageData.sender?.uuid || `business_${messageUserId}`,
        };

        handleBusinessJoined(businessUserData);
      }
    }

    // Handle regular messages
    if (messageData.text_content || messageData.content) {
      try {
        console.log("🔧 Processing regular message:", {
          content: messageData.content,
          user_id: messageData.user_id,
          uuid: messageData.uuid,
        });

        const displayMessage = convertToDisplayMessage(messageData);
        console.log("🔧 Converted message:", {
          id: displayMessage.id,
          content: displayMessage.content,
          isUser: displayMessage.isUser,
          user_name: displayMessage.user_name,
        });

        // ✅ Special handling for business joined messages
        if (
          metadata.type === "business_joined" ||
          metadata.sender_type === "business"
        ) {
          displayMessage.metadata = {
            ...displayMessage.metadata,
            type: "info" as const,
            extras: {
              ...displayMessage.metadata?.extras,
              business_joined: true,
              celebration: true,
              icon: "user-check",
              message_type: "business_joined",
              sender_type: "business",
              business_name: metadata.sender_name || messageData.sender?.name,
              system_message: true,
              highlight: true,
            },
          };
        }

        // Check if this is from a business user
        const isFromBusiness =
          metadata.sender_type === "business" ||
          messageData.sender_type === "business" ||
          (messageData.sender &&
            messageData.sender.uuid !== Logic.Auth.AuthUser?.uuid &&
            messageData.sender.uuid !== "greep_ai");

        // ✅ NEW: Accumulate delivery data for user messages with address metadata
        if (
          options.workflowType === "deliveries" &&
          messageData.user_id === parseInt(Logic.Auth.AuthUser?.id || "0")
        ) {
          if (metadata.pickup_address || metadata.delivery_address) {
            const newData: any = {};
            if (metadata.pickup_address) {
              newData.pickupAddress = metadata.pickup_address;
              newData.pickup_address = metadata.pickup_address;
            }
            if (metadata.delivery_address) {
              newData.deliveryAddress = metadata.delivery_address;
              newData.delivery_address = metadata.delivery_address;
            }

            // Save to conversation metadata
            try {
              const conversationData = Logic.Messaging.SingleConversation;
              if (conversationData) {
                let existingMetadata = {};
                if (conversationData.metadata) {
                  existingMetadata =
                    typeof conversationData.metadata === "string"
                      ? JSON.parse(conversationData.metadata)
                      : conversationData.metadata;
                }

                const updatedMetadata = {
                  ...existingMetadata,
                  deliveryOrderData: {
                    ...(existingMetadata as any).deliveryOrderData,
                    ...newData,
                  },
                };

                conversationData.metadata = JSON.stringify(updatedMetadata);
                console.log(
                  "💾 Saved address data to conversation metadata:",
                  updatedMetadata.deliveryOrderData
                );
              }
            } catch (e) {
              console.warn(
                "⚠️ Could not save address data to conversation metadata:",
                e
              );
            }
          }
        }

        if (isFromBusiness) {
          // Mark as business message and enable direct messaging
          displayMessage.metadata = {
            type: displayMessage.metadata?.type || "text",
            ...displayMessage.metadata,
            extras: {
              ...displayMessage.metadata?.extras,
              from_business: true,
            },
          };

          if (!businessJoined.value) {
            console.log(
              "🎉 Business message detected - enabling direct messaging"
            );

            // Extract business name from message sender - try multiple sources
            const extractedBusinessName =
              metadata.sender_name || // From message metadata (most reliable for business messages)
              (messageData.sender?.first_name && messageData.sender?.last_name
                ? `${messageData.sender.first_name} ${messageData.sender.last_name}`
                : messageData.sender?.name) ||
              messageData.user_name ||
              displayMessage.user_name ||
              "Delivery Partner";

            console.log("🔧 Extracted business name:", extractedBusinessName, {
              metadata_sender_name: metadata.sender_name,
              sender_data: messageData.sender,
              user_name: messageData.user_name,
              display_user_name: displayMessage.user_name,
            });

            // Store business name for header display
            businessName.value = extractedBusinessName;

            businessJoined.value = true;
            directMessagingEnabled.value = true;

            // ✅ Add business user to conversation participants for header display
            const conversationData = Logic.Messaging.SingleConversation;
            if (conversationData && conversationData.participants) {
              // Check if business user is already in participants
              const businessExists = conversationData.participants.some(
                (participant: any) => {
                  if (participant.user) {
                    const fullName =
                      `${participant.user.first_name} ${participant.user.last_name}`.trim();
                    return fullName === extractedBusinessName;
                  }
                  return false;
                }
              );

              if (!businessExists) {
                // Split business name into first and last name
                const nameParts = extractedBusinessName.split(" ");
                const firstName = nameParts[0] || "";
                const lastName = nameParts.slice(1).join(" ") || "";

                // Add business user to participants array using the expected structure
                (conversationData.participants as any[]).push({
                  user_id:
                    messageData.sender_uuid ||
                    metadata.sender_uuid ||
                    "business_user",
                  user: {
                    first_name: firstName,
                    last_name: lastName,
                    id:
                      messageData.sender_uuid ||
                      metadata.sender_uuid ||
                      "business_user",
                    email: "",
                    created_at: new Date().toISOString(),
                    businesses: [],
                    updated_at: new Date().toISOString(),
                    phone: "",
                  },
                  type: "business",
                  joined_at: new Date().toISOString(),
                });

                console.log(
                  "✅ Added business user to participants:",
                  extractedBusinessName
                );
                console.log(
                  "🔧 Updated participants:",
                  conversationData.participants
                );
              }
            }

            // ✅ Stop the countdown timer when business joins
            stopCountdown();

            // ✅ Add workflow completion messages with actual business name
            setTimeout(() => {
              const completionMessages = [
                {
                  id: `workflow_complete_1_${Date.now()}`,
                  content: `✅ Great! ${extractedBusinessName} has joined the conversation.`,
                  text_content: `✅ Great! ${extractedBusinessName} has joined the conversation.`,
                  user_uuid: "greep_ai",
                  user_name: "GreepPay AI",
                  type: "text" as const,
                  isUser: false,
                  timestamp: new Date(),
                  sender: { uuid: "greep_ai", name: "GreepPay AI" },
                },
                {
                  id: `workflow_complete_2_${Date.now() + 1}`,
                  content:
                    "🚀 You can now chat directly to coordinate pickup and delivery details.",
                  text_content:
                    "🚀 You can now chat directly to coordinate pickup and delivery details.",
                  user_uuid: "greep_ai",
                  user_name: "GreepPay AI",
                  type: "text" as const,
                  isUser: false,
                  timestamp: new Date(),
                  sender: { uuid: "greep_ai", name: "GreepPay AI" },
                },
                {
                  id: `workflow_complete_3_${Date.now() + 2}`,
                  content:
                    "📍 Share specific pickup details and any special instructions.",
                  text_content:
                    "📍 Share specific pickup details and any special instructions.",
                  user_uuid: "greep_ai",
                  user_name: "GreepPay AI",
                  type: "text" as const,
                  isUser: false,
                  timestamp: new Date(),
                  sender: { uuid: "greep_ai", name: "GreepPay AI" },
                },
              ];

              completionMessages.forEach((msg, index) => {
                setTimeout(() => addMessage(msg), index * 1000);
              });
            }, 500);
          }
        }

        // Apply message filtering
        const filterResult = await messageFiltering.filterMessage({
          id: displayMessage.id,
          content: displayMessage.content || displayMessage.text_content,
          text_content: displayMessage.text_content,
          user_uuid: displayMessage.user_uuid,
          user_name: displayMessage.user_name,
          sender: messageData.sender,
          metadata: JSON.stringify(displayMessage.metadata || {}),
        });

        // If message should be blocked, don't add it
        if (filterResult.shouldBlock) {
          console.log("🚫 Message filtered:", filterResult.reason);
          return;
        }

        console.log("🔧 Adding message to array...");
        displayMessage.content = fillUpMessageTemplate(displayMessage.content);
        displayMessage.text_content = fillUpMessageTemplate(
          displayMessage.text_content
        );
        addMessage(displayMessage);
        console.log("🔧 Messages array length after adding:", messages.length);

        // Modal triggers (keeping existing logic)
        if (!displayMessage.isUser && displayMessage.content) {
          const content = displayMessage.content.toLowerCase();

          // ✅ NEW: Detect delivery successful message and add Details/Receipt buttons
          if (
            content.includes("delivery completed successfully") ||
            content.includes("✅ delivery completed successfully")
          ) {
            console.log(
              "🎉 Delivery successful message detected - adding Details/Receipt buttons"
            );
            setTimeout(() => {
              const buttonsMessage = {
                id: `delivery_buttons_${Date.now()}`,
                content: "Delivery successful",
                text_content: "Delivery successful",
                user_uuid: "greep_ai",
                user_name: "Greep AI",
                type: "text" as const,
                info_icon: "",
                isUser: false,
                timestamp: new Date(),
                metadata: {
                  type: "options",
                  options: [
                    {
                      value: "details",
                      content: "Details",
                      type: "info",
                      message: "Details",
                    },
                    {
                      value: "receipt",
                      content: "Receipt",
                      type: "info",
                      message: "Receipt",
                    },
                  ],
                },
                actions: [
                  {
                    label: "Details",
                    value: "details",
                    type: "info" as const,
                    message: "Details",
                    disabled: false,
                    handler: () => {
                      console.log("📋 View delivery details clicked");
                      // This will be handled in the component
                    },
                  },
                  {
                    label: "Receipt",
                    value: "receipt",
                    type: "info" as const,
                    message: "Receipt",
                    disabled: false,
                    handler: () => {
                      console.log("🧾 View receipt clicked");
                      // This will be handled in the component
                    },
                  },
                ],
                sender: { uuid: "greep_ai", name: "Greep AI" },
              };
              addMessage(buttonsMessage);
            }, 1000);
          } else if (
            content.includes("pickup location") &&
            content.includes("branches")
          ) {
            console.log("🔧 PICKUP-LOCATION: Manually triggering pickup modal");
            setTimeout(() => {
              manualModalOverride.value = "cash_pickup";
            }, 500);
          } else if (
            content.includes("address") &&
            content.includes("delivery")
          ) {
            setTimeout(() => {
              manualModalOverride.value = "address";
            }, 500);
          } else if (content.includes("bank") && content.includes("account")) {
            setTimeout(() => {
              manualModalOverride.value = "bank_transfer";
            }, 500);
          }
        }
      } catch (error) {
        console.error("❌ Error handling incoming message:", error);
      }
    } else {
      console.log("⏭️ No content in message, skipping:", messageData);
    }
  };

  // Initialize with existing conversation messages
  const initializeFromConversation = (conversation: any) => {
    if (!conversation) return;

    isBusinessUser.value = detectBusinessUser(conversation);

    // ✅ FIX: Only enable business mode when there are actually 2+ participants
    // Don't automatically assume business joined just because of participant count
    const participantCount = conversation?.participants?.length || 0;

    if (participantCount > 1 && isBusinessUser.value) {
      businessJoined.value = true;
      directMessagingEnabled.value = true;
    } else {
      businessJoined.value = false;
      directMessagingEnabled.value = false;
    }

    // Clear existing messages array first
    messages.splice(0, messages.length);

    // Rearrage messages asc by id
    conversation.messages.sort((first, next) => first.id - next.id);

    // ✅ For business users, show all messages
    if (isBusinessUser.value) {
      console.log("🔧 Business user detected");

      // Force enable business mode for existing conversations
      businessJoined.value = true;
      directMessagingEnabled.value = true;

      //  Load messages
      if (conversation.messages) {
        conversation.messages.forEach((msg: any) => {
          const displayMessage = convertToDisplayMessage(msg);
          addMessage(displayMessage);
        });
      }
    } else {
      // ✅ For regular users, load existing messages
      console.log("🔧 Regular user - loading existing messages");

      if (conversation.messages) {
        conversation.messages.forEach((msg: any) => {
          const displayMessage = convertToDisplayMessage(msg);
          addMessage(displayMessage);
        });
      }
    }

    // Set current stage
    currentStage.value = conversation.stage || "";

    // Auto-initialize workflow if needed
    if (!directMessagingEnabled.value && messages.length === 0) {
      console.log("🎯 Auto-starting workflow...");

      // Check if conversation has amount in metadata for auto-send
      const conversationMetadata = conversation.metadata
        ? typeof conversation.metadata === "string"
          ? JSON.parse(conversation.metadata)
          : conversation.metadata
        : {};

      const chatIsMarketOrder =
        // @ts-expect-error
        Logic.Messaging.SingleConversation?.market_order != undefined;

      if (!chatIsMarketOrder) {
        setTimeout(() => {
          initializeWorkflow(conversationMetadata);
        }, 100); // Small delay to ensure everything is ready
      }
    }
  };

  // Initialize workflow conversation if needed
  const initializeWorkflow = async (
    conversationMetadata?: any,
    forceInitialize = false
  ) => {
    // Only initialize if we're in workflow mode and have no messages
    if (
      (directMessagingEnabled.value || messages.length > 0) &&
      !forceInitialize
    ) {
      return;
    }

    const chatIsMarketOrder =
      // @ts-expect-error
      Logic.Messaging.SingleConversation?.market_order != undefined;

    try {
      const welcomeMessage = {
        id: `msg-${Date.now()}`,
        conversation_id: conversationId,
        content:
          "Hi! 👋 I'm here to help you with your transaction. Let me guide you through the process.",
        user_id: 0,
        sender: { uuid: "greep_ai", name: "Greep AI" },
        metadata: {
          type: "text",
          stage: "welcome",
          timestamp: new Date().toISOString(),
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      if (!chatIsMarketOrder) {
        addMessage(welcomeMessage);

        setTimeout(async () => {
          try {
            // Get wallet balance like the backup did
            const balance = Logic.Auth.AuthUser?.wallet?.total_balance || "0";

            let startingStage = "withdrawal_amount";

            if (
              Logic.Messaging.SingleConversation?.entity_type === "p2p_deposit"
            ) {
              startingStage = "deposit_amount";
            }

            const exchangeAd = Logic.Messaging.SingleConversation?.exchangeAd;

            const exchangeCurreny = exchangeAd?.from_currency;

            const currencyInfo = availableCurrencies.find(
              (currency) => currency.code === exchangeCurreny
            );

            // Set up message form
            Logic.Messaging.CreateMessageForm = {
              input: {
                conversation_id: conversationId.value,
                content: "Hi", // Use "Hi" like the backup, not "Starting conversation flow..."
                type: "text",
                sender_id: parseInt(Logic.Auth.AuthUser?.id?.toString() || "0"),
                metadata: JSON.stringify({
                  is_bot: false,
                  type: "text",
                  wallet_balance: Logic.Common.convertToMoney(
                    balance,
                    true,
                    "",
                    false
                  ),
                  sell_currency_name: currencyInfo?.name || "",
                  sell_currency_code: currencyInfo?.code || "",
                  currency_symbol: currencyInfo?.symbol || "",
                  buy_rate: Logic.Common.convertToMoney(
                    exchangeAd?.rate || "0",
                    true,
                    "",
                    false
                  ),
                  stage: startingStage,
                  trigger_conversation: true,
                  structured_response: {},
                  conversation_metadata: conversationMetadata || {},
                  exchangeAd:
                    Logic.Messaging.SingleConversation?.exchangeAd || null,
                  customer_name:
                    `${Logic.Auth.AuthUser?.first_name} ${Logic.Auth.AuthUser?.last_name}`.trim(),
                  user_name: `${Logic.Auth.AuthUser?.first_name}}`.trim(),
                  sender: {
                    first_name: Logic.Auth.AuthUser?.first_name,
                    last_name: Logic.Auth.AuthUser?.last_name,
                    uuid: Logic.Auth.AuthUser?.uuid,
                  },
                }),
              },
            };

            const response = await Logic.Messaging.CreateMessage();
          } catch (error) {
            console.error("❌ Failed to trigger backend conversation:", error);
          }
        }, 500); // Match the original delay from backup
      } else if (chatIsMarketOrder) {
        const currentConversation = Logic.Messaging.SingleConversation;
        const currencyStage = currentConversation?.stage || "exchange_rate";

        if (currencyStage == "instant_bill_acceptance_1") {
          await sendWorkflowMessage("{delivery_order_summary}", {
            selected_option: "accept",
            ...conversationMetadata,
            // @ts-expect-error
            delivery_order_data: currentConversation?.delivery_order,
          });
        }
      }
    } catch (error) {
      console.error("❌ Failed to initialize workflow:", error);
    }
  };

  // Current input requirements based on last AI message
  const expectedInput = computed(() => {
    const lastAI = getLastAIMessage();
    return lastAI?.metadata?.extras || {};
  });

  // Check if we need a specific modal
  const activeModal = computed(() => {
    const extras = expectedInput.value;

    if (extras.input_type === "address") return "address";
    if (extras.input_type === "bank_account") return "bank_transfer";
    if (extras.input_type === "pickup_location") return "cash_pickup";
    if (extras.input_type === "datetime") return "datetime";
    if (extras.input_type === "proof_upload") return "proof_upload";

    return null;
  });

  // Handle action button clicks
  const handleActionClick = async (action: any) => {
    try {
      console.log("🔧 Action button clicked:", {
        actionValue: action.value,
        currentStage: currentStage.value,
        isProcessing: isProcessing.value,
      });

      // Prevent multiple clicks during processing
      if (isProcessing.value) {
        console.log("⚠️ Already processing, ignoring click");
        return false;
      }

      const entityType = Logic.Messaging.SingleConversation?.entity_type;

      if (entityType == "p2p_withdrawal" || entityType == "p2p_deposit") {
        // Create P2P Order when confirm is clicked
        if (action.value === "confirm") {
          console.log("📋 Confirm button clicked - creating P2P order");
          await createP2POrder();
          return true;
        }

        // ✅ NEW: Handle fund release when "yes" is clicked in payment-related stages
        if (action.value === "yes") {
          console.log(
            "� DEBUG: 'Yes' button clicked - checking for fund release conditions"
          );
          console.log("� DEBUG: Current stage:", currentStage.value);
          console.log(
            "🔧 DEBUG: Stage includes 'finalize':",
            currentStage.value.includes("finalize")
          );
          console.log(
            "🔧 DEBUG: Stage includes 'payment':",
            currentStage.value.includes("payment")
          );

          // The "Yes, release USDC" button is unique in the workflow, so always trigger fund release
          console.log("💰 Yes button clicked - attempting to release funds");
          await releaseFunds();
          return true;
        }
      }
      // ✅ FIX: Map button values to workflow expected values
      let workflowOption = action.value;

      // ✅ NEW: Special handling for delivery workflow "accept" button
      // if (
      //   action.value === "accept" &&
      //   currentStage.value.includes("instant_bill_acceptance")
      // ) {
      //   console.log(
      //     "💳 Delivery bill acceptance - showing payment confirmation"
      //   );
      //   // Trigger payment confirmation modal instead of immediately proceeding
      //   showPaymentConfirmation.value = true;
      //   return true; // Don't send workflow message yet, wait for payment confirmation
      // }

      // ✅ DEBUGGING: Check if this is a delivery accept without proper stage detection
      if (action.value === "accept" && options.workflowType === "deliveries") {
        console.log("🔍 DELIVERY ACCEPT DEBUG:", {
          actionValue: action.value,
          currentStage: currentStage.value,
          workflowType: options.workflowType,
          lastMessages: messages.slice(-3).map((m: any) => ({
            content: m.content?.substring(0, 30),
            isUser: m.sender?.uuid != "user",
          })),
        });

        // Check if the last AI message contains bill/cost content
        const lastAIMessage = getLastAIMessage();

        console.log("🔍 Last AI message for bill detection:", lastAIMessage);
        const isBillMessage =
          lastAIMessage?.content?.toLowerCase().includes("bill") ||
          lastAIMessage?.content?.toLowerCase().includes("accept");

        if (isBillMessage) {
          console.log(
            "💳 FORCING delivery bill acceptance - showing payment confirmation"
          );

          await createDeliveryOrder();

          return true;
        }
      }

      // Map "accept" to "accept" for exchange_rate step
      // Map "confirm_payment" to "confirm_payment" for send_payment step
      // Map other buttons as needed for different workflow steps
      if (action.value === "accept") {
        workflowOption = "accept";
      } else if (action.value === "confirm_payment") {
        workflowOption = "confirm_payment";
      }

      // ✅ CRITICAL: Always use sendWorkflowMessage for action buttons
      // This ensures workflow state transitions work even after business joins
      await sendWorkflowMessage(action.message, {
        selected_option: workflowOption,
      });
      return true;
    } catch (error) {
      console.error("❌ Error handling action click:", error);
      return false;
    }
  };

  // ✅ NEW: Release funds function based on the pattern from ChatConversationPage
  const releaseFunds = async () => {
    try {
      // Get conversation metadata to find order UUID
      const conversationData = Logic.Messaging.SingleConversation;
      console.log("🔍 Conversation data:", conversationData);

      const conversationMetadata = conversationData?.metadata
        ? JSON.parse(conversationData.metadata)
        : {};

      console.log("🔍 Parsed conversation metadata:", conversationMetadata);

      showPaymentConfirmation.value = false; // Close confirmation modal if open

      // Try to get orderUuid from multiple sources
      let orderUuid = currentOrderUuid.value; // First try our stored reactive variable
      let amount = conversationMetadata?.amount;

      // If no UUID in reactive variable, try metadata
      if (!orderUuid) {
        orderUuid = conversationMetadata?.order_uuid;
      }

      // If no order UUID in metadata, try to get it from conversation entity or recent order creation
      if (!orderUuid) {
        // Try to get from conversation entity_uuid (sometimes P2P orders use this)
        const entityUuid = (conversationData as any)?.entity_uuid;
        if (entityUuid) {
          orderUuid = entityUuid;
        }
      }

      Logic.Common.showLoader({
        show: true,
        loading: true,
      });

      if (!orderUuid) {
        await Logic.Messaging.GetSingleConversation(conversationData?.uuid);

        orderUuid = Logic.Messaging.SingleConversation?.p2p_order?.uuid || null;
      }

      if (!orderUuid) {
        Logic.Common.showAlert({
          show: true,
          message:
            "Order UUID not found. The order was created but metadata wasn't updated properly. Please refresh the page and try the fund release again.",
          type: "error",
        });
        return;
      }

      if (!amount) {
        Logic.Common.showAlert({
          show: true,
          message: "Order amount not found. Cannot release funds.",
          type: "error",
        });
        return;
      }

      // Call the wallet release function with type casting
      const result = await Logic.Wallet.ReleaseP2pFunds(
        orderUuid,
        parseFloat(
          Logic.Messaging.SingleConversation?.p2p_order?.amount || amount
        ),
        JSON.stringify({
          stage: "finalize_payment",
          action: "release_usdc",
          timestamp: Date.now(),
        })
      );

      console.log("✅ Funds released successfully, result:", result);

      // Add success message to chat
      const successMessage: WorkflowMessage = {
        id: `success_${Date.now()}`,
        content: "🎉 P2P trade successful! USDC has been released.",
        text_content: "🎉 P2P trade successful! USDC has been released.",
        user_uuid: "greep_ai",
        user_name: "GreepPay AI",
        type: "text",
        isUser: false,
        timestamp: new Date(),
        metadata: {
          type: "text",
          extras: {
            success: true,
            trade_completed: true,
          },
        },
      };

      addMessage(successMessage);

      // Also send workflow message to backend to complete the workflow
      await sendWorkflowMessage("yes", {
        selected_option: "yes",
      });
    } catch (error) {
      console.error("❌ Error releasing funds:", error);
      Logic.Common.showAlert({
        show: true,
        message: "Error releasing funds. Please try again or contact support.",
        type: "error",
      });
    }
  };

  // Create P2P Order function
  const createP2POrder = async () => {
    try {
      if (isProcessing.value || orderCreated.value) {
        return null;
      }
      isProcessing.value = true;

      // Get required data from conversation
      const conversationData = Logic.Messaging.SingleConversation;
      const conversationUuid = conversationData?.uuid;
      const exchangeAd = conversationData?.exchangeAd;

      const conversationMetadata = conversationData?.metadata
        ? typeof conversationData.metadata === "string"
          ? JSON.parse(conversationData.metadata)
          : conversationData.metadata
        : {};

      const chatMetadata: any = getChatMetadata();

      // ✅ Extract pickup location data from conversation metadata
      const isCashPickupOrder = chatMetadata.pickup_location ? true : false;
      const pickupLocation = chatMetadata?.pickup_location
        ? `${chatMetadata.pickup_location?.name} - ${chatMetadata.pickup_location?.description}. <a class="!underline" href="${chatMetadata.pickup_location?.google_map_link}" target="_blank" rel="noopener noreferrer">See on map</a>`
        : "";
      const pickupLocationName = "";
      const pickupLocationAddress = "";
      const pickupLocationCity = "";
      const pickupLocationCountry = "";

      const orderSummary = extractOrderSummary();
      if (!orderSummary) {
        throw new Error(
          "Could not extract order summary for P2P order creation"
        );
      }

      // ✅ Determine correct payment type and payout option
      let paymentType = "cash";
      let payoutOption = "cash_delivery";
      let deliveryAddress = "";
      let city = "Lagos";
      let country = "Nigeria";

      const userMessages = messages.filter((m) => m.sender?.uuid != "user");
      const hasBankTransfer = userMessages.some((m) =>
        m.content.toLowerCase().includes("bank:")
      );

      if (isCashPickupOrder) {
        // ✅ Cash pickup order
        paymentType = "cash_pickup";
        payoutOption = "pickup";
        deliveryAddress =
          pickupLocation ||
          `Pickup: ${pickupLocationName} - ${pickupLocationAddress}, ${pickupLocationCity}`;
        city = pickupLocationCity || "Lagos";
        country = pickupLocationCountry || "Nigeria";
      } else if (
        hasBankTransfer ||
        conversationMetadata.method === "transfer"
      ) {
        // ✅ Bank transfer method
        paymentType = "transfer";
        payoutOption = "bank_transfer";

        // Extract bank account details from messages
        const bankMessage = userMessages.find((m) =>
          m.content.toLowerCase().includes("bank:")
        );
        if (bankMessage) {
          deliveryAddress = bankMessage.content.replace(/bank:\s*/i, "");
        }
        city = "Lagos"; // Default for delivery
        country = "Nigeria"; // Default for delivery
      } else {
        // ✅ Cash delivery method - extract address and location
        const addressMessage = userMessages.find(
          (m) =>
            m.content.length > 20 &&
            !m.content.toLowerCase().includes("usdc") &&
            (m.content.includes(",") ||
              m.content.toLowerCase().includes("street"))
        );

        if (addressMessage) {
          deliveryAddress = addressMessage.content;
          // Try to extract city/country from address
          const addressParts = deliveryAddress.split(",").map((p) => p.trim());
          if (addressParts.length >= 2) {
            city = addressParts[addressParts.length - 2] || city;
            country = addressParts[addressParts.length - 1] || country;
          }
        }
      }

      // Extract amount from order summary
      let amount = parseFloat(orderSummary.youSell.replace(/[^\d.]/g, "")) || 0;

      if (amount <= 0) {
        throw new Error("Invalid amount for P2P order creation");
      }

      const entityType = conversationData?.entity_type;

      if (entityType == "p2p_deposit") {
        const chatMetadata: any = getChatMetadata();

        if (chatMetadata) {
          amount = parseFloat(chatMetadata.usd_amount) || amount;
          paymentType = "online_payment";
          payoutOption = "online_payment";
        }
      }

      // ✅ Prepare order data
      const orderData = {
        exchange_ad_uuid: exchangeAd?.uuid || "", // Ensure it's never undefined
        amount: amount,
        delivery_address: deliveryAddress || "Online payment details",
        city: city,
        country: country,
        payment_type: paymentType,
        payout_option: payoutOption,
        conversation_uuid: conversationUuid || "", // Ensure it's never undefined
        metadata: JSON.stringify({
          conversation_id: conversationData?.id,
          user_id: Logic.Auth.AuthUser?.id,
          user_uuid: Logic.Auth.AuthUser?.uuid,
          business_name: exchangeAd?.business?.business_name,
          business_uuid: exchangeAd?.business?.uuid,
          created_at: new Date().toISOString(),
          location_context: {
            city: city,
            country: country,
          },
          // ✅ Include pickup location details for pickup orders
          ...(isCashPickupOrder && {
            pickup_location: pickupLocation,
            pickup_location_name: pickupLocationName,
            pickup_location_address: pickupLocationAddress,
            pickup_location_city: pickupLocationCity,
            pickup_location_country: pickupLocationCountry,
          }),
        }),
      };

      try {
        const createdOrder = await Logic.Wallet.CreateP2pOrder(orderData);

        if (createdOrder) {
          // ✅ Store order ID and UUID in reactive variables for immediate access
          if (createdOrder.id) {
            currentOrderId.value = String(createdOrder.id);
          }
          if (createdOrder.uuid) {
            currentOrderUuid.value = createdOrder.uuid;
          }

          // ✅ Save order_uuid to conversation metadata
          if (createdOrder.uuid) {
            try {
              const conversationData = Logic.Messaging.SingleConversation;
              if (conversationData) {
                const currentMetadata = conversationData.metadata
                  ? JSON.parse(conversationData.metadata)
                  : {};
                currentMetadata.order_uuid = createdOrder.uuid;
                currentMetadata.order_data = orderData;
                conversationData.metadata = JSON.stringify(currentMetadata);
              }
            } catch (error) {
              console.error("❌ Error storing order UUID in metadata:", error);
            }
          }

          console.log("✅ P2P Order created successfully:", createdOrder);

          // ✅ Set order created flag
          orderCreated.value = true;

          // ✅ Enable direct messaging for everyone
          directMessagingEnabled.value = true;

          console.log("🔍 ORDER CREATION - Message clearing decision:");
          console.log("  📊 Current messages count:", messages.length);
          console.log("  👤 Business joined status:", businessJoined.value);

          // ✅ FIXED: Only clear messages if business hasn't joined yet
          if (false) {
            console.log("  �️ Clearing", messages.length, "messages");
            console.log(
              "🔧 Selective clearing - preserving business/chat messages"
            );

            // Filter messages to keep business messages and regular chat
            const messagesToKeep = messages.filter((m: any) => {
              // Keep regular chat messages (those with is_regular_chat metadata)
              if (m.metadata?.is_regular_chat) {
                console.log(
                  "  💬 Keeping regular chat message:",
                  m.content.substring(0, 30)
                );
                return true;
              }

              // Keep business user messages (non-AI, non-current user)
              const currentUserId = parseInt(Logic.Auth.AuthUser?.id || "0");
              const isBusinessMessage =
                !(m.sender?.uuid != "user") &&
                m.user_name !== "GreepPay AI" &&
                m.user_name !== "GreepPay System" &&
                m.user_uuid !== "greep_ai";
              if (isBusinessMessage) {
                console.log(
                  "  👤 Keeping business message:",
                  m.content.substring(0, 30)
                );
                return true;
              }

              // Keep recent user chat messages (not workflow responses)
              if (
                m.sender?.uuid != "user" &&
                (m.id.toString().startsWith("temp_") ||
                  m.metadata?.is_regular_chat)
              ) {
                console.log(
                  "  💭 Keeping user chat message:",
                  m.content.substring(0, 30)
                );
                return true;
              }

              console.log(
                "  🗑️ Removing workflow message:",
                m.content.substring(0, 30)
              );
              return false;
            });

            console.log(
              "  📊 Messages to keep:",
              messagesToKeep.length,
              "out of",
              messages.length
            );

            // Clear and replace with filtered messages
            messages.length = 0;
            messagesToKeep.forEach((msg: any) => messages.push(msg));

            console.log(
              "  ✅ Smart clearing complete, remaining messages:",
              messages.length
            );
            console.log("  ✅ Messages cleared, new count:", messages.length);
          } else {
            console.log("🔧 Keeping messages - business already joined");
            console.log("  📊 Keeping", messages.length, "existing messages");
          }

          // Create order summary message only
          // const orderSummaryMessage: WorkflowMessage = {
          //   id: `order_summary_${Date.now()}`,
          //   content: "Order Summary",
          //   text_content: "Order Summary",
          //   user_uuid: "greep_ai",
          //   user_name: "GreepPay AI",
          //   type: "text" as const,
          //   isUser: false,
          //   timestamp: new Date(),
          //   sender: { uuid: "greep_ai", name: "GreepPay AI" },
          //   isOrderSummary: true,
          //   orderSummary: orderSummary,
          // };

          // addMessage(orderSummaryMessage);

          // ✅ Start countdown timer
          setTimeout(() => {
            startCountdown("waiting_business", 600); // 10 minutes

            // Add countdown message
            const countdownMessage: WorkflowMessage = {
              id: `countdown_${Date.now()}`,
              content: "⏰ Order created! Waiting for business to accept...",
              text_content:
                "⏰ Order created! Waiting for business to accept...",
              user_uuid: "greep_ai",
              user_name: "GreepPay AI",
              type: "text" as const,
              isUser: false,
              timestamp: new Date(),
              sender: { uuid: "greep_ai", name: "GreepPay AI" },
            };
            addMessage(countdownMessage);
          }, 1000);

          // ✅ IMPORTANT: Send workflow message to trigger step transition to send_payment
          console.log("🎯 Sending workflow transition message to backend");

          isProcessing.value = false;
          if (options.workflowType == "p2p_deposit") {
            // await sendWorkflowMessage(
            //   "Your order has been confirmed. Please follow the payment instructions.",
            //   {
            //     selected_option: "confirm",
            //   }
            // );
          } else {
            await sendWorkflowMessage("Order confirmed", {
              selected_option: "success",
            });
          }

          // ✅ NEW: Add delay and then check if stage transition occurred
          const entityType = conversationData?.entity_type;

          if (entityType == "p2p_withdrawal") {
            setTimeout(async () => {
              try {
                console.log(
                  "🔍 Checking if workflow stage transitioned after order creation..."
                );

                // Refresh conversation to get updated stage
                const conversationId = Logic.Messaging.SingleConversation?.id;
                if (conversationId) {
                  await Logic.Messaging.GetSingleConversation(
                    conversationId.toString()
                  );
                  const updatedStage =
                    Logic.Messaging.SingleConversation?.stage;
                  console.log("🔍 Updated conversation stage:", updatedStage);

                  if (updatedStage && updatedStage.includes("send_payment")) {
                    console.log(
                      "✅ Workflow successfully transitioned to send_payment stage"
                    );
                  } else {
                    console.warn(
                      "⚠️ Workflow still in order_summary stage - transition may have failed"
                    );
                    console.log(
                      "🔄 Attempting to resend transition message..."
                    );

                    // // Try sending the transition message again
                    // await sendWorkflowMessage("Transition to send_payment", {
                    //   selected_option: "success",
                    // });
                  }
                }
              } catch (error) {
                console.error(
                  "❌ Error checking workflow stage transition:",
                  error
                );
              }
            }, 3000); // Wait 3 seconds for backend processing
          }

          return createdOrder;
        }
      } catch (graphqlError: any) {
        console.error("❌ GraphQL Error details:", {
          message: graphqlError.message,
          graphQLErrors: graphqlError.graphQLErrors,
          networkError: graphqlError.networkError,
        });
        directMessagingEnabled.value = true;
        return null;
      }
    } catch (error) {
      console.error("❌ Error creating P2P order:", error);

      directMessagingEnabled.value = true;
      return null;
    } finally {
      isProcessing.value = false;
    }
  };

  // ✅ NEW: Create Delivery Order function (following P2P pattern)
  const createDeliveryOrder = async () => {
    try {
      if (isProcessing.value || orderCreated.value) {
        return null;
      }
      isProcessing.value = true;

      // Get required data from conversation
      const conversationData = Logic.Messaging.SingleConversation;
      const conversationUuid = conversationData?.uuid;

      const conversationMetadata = conversationData?.metadata
        ? typeof conversationData.metadata === "string"
          ? JSON.parse(conversationData.metadata)
          : conversationData.metadata
        : {};

      // ✅ Get delivery data from accumulated conversation metadata
      let deliveryData: any = {};

      // First, try to get accumulated delivery data from conversation metadata
      try {
        if (conversationMetadata && conversationMetadata.deliveryOrderData) {
          deliveryData = conversationMetadata.deliveryOrderData;
          console.log(
            "✅ Using accumulated delivery data from metadata:",
            deliveryData
          );
        }
      } catch (e) {
        console.warn(
          "⚠️ Could not parse accumulated delivery data from metadata"
        );
      }

      // If no accumulated data, fall back to extracting from extras and messages
      if (!deliveryData || Object.keys(deliveryData).length === 0) {
        console.log(
          "⚠️ No accumulated data found, extracting from extras and messages..."
        );

        try {
          const extras = (conversationData as any)?.extras;
          if (extras) {
            deliveryData =
              typeof extras === "string" ? JSON.parse(extras) : extras;
          }
          // Merge with metadata if available
          if (
            conversationMetadata &&
            Object.keys(conversationMetadata).length > 0
          ) {
            deliveryData = { ...deliveryData, ...conversationMetadata };
          }
        } catch (e) {
          console.warn(
            "⚠️ Could not parse conversation data for delivery order"
          );
        }
      }

      // Extract delivery details with fallbacks
      const itemDescription =
        deliveryData.item_description ||
        deliveryData.itemDescription ||
        "Package";
      const pickupAddress =
        deliveryData.pickup_address ||
        deliveryData.pickupAddress ||
        "Pickup Location";
      const deliveryAddress =
        deliveryData.delivery_address ||
        deliveryData.deliveryAddress ||
        "Delivery Location";
      // ✅ Calculate delivery cost based on pickup and delivery areas
      let deliveryPrice = 10; // Default fallback

      // Try to get area keys from conversation metadata
      let pickupAreaKey = null;
      let deliveryAreaKey = null;

      try {
        const metadata = conversationData?.metadata
          ? typeof conversationData.metadata === "string"
            ? JSON.parse(conversationData.metadata)
            : conversationData.metadata
          : {};

        pickupAreaKey =
          metadata.pickup_area_key ||
          getAreaKeyFromValue(deliveryData.pickup_area || "");
        deliveryAreaKey =
          metadata.delivery_area_key ||
          getAreaKeyFromValue(deliveryData.delivery_area || "");

        console.log("🗺️ Area keys for pricing:", {
          pickupAreaKey,
          deliveryAreaKey,
        });
      } catch (error) {
        console.error("❌ Error extracting area keys:", error);
      }

      // If we have both areas, calculate route-based pricing
      if (pickupAreaKey && deliveryAreaKey) {
        deliveryPrice = calculateDeliveryCost(pickupAreaKey, deliveryAreaKey);
        console.log(
          "💰 Using route-based delivery cost:",
          deliveryPrice,
          `(${pickupAreaKey} → ${deliveryAreaKey})`
        );
      }
      // Fallback: check if we have area-based cost from the new address component
      else if (
        deliveryData.delivery_cost &&
        !isNaN(parseFloat(deliveryData.delivery_cost))
      ) {
        deliveryPrice = parseFloat(deliveryData.delivery_cost);
        console.log("💰 Using area-based delivery cost:", deliveryPrice);
      }
      // Fallback: check if we have pickup_cost (for pickup addresses)
      else if (
        deliveryData.pickup_cost &&
        !isNaN(parseFloat(deliveryData.pickup_cost))
      ) {
        deliveryPrice = parseFloat(deliveryData.pickup_cost);
        console.log("💰 Using area-based pickup cost:", deliveryPrice);
      }
      // Final fallback: try to get price from legacy fields
      else if (deliveryData.price || deliveryData.deliveryPrice) {
        deliveryPrice =
          parseFloat(deliveryData.price || deliveryData.deliveryPrice) || 10;
        console.log("💰 Using legacy price field:", deliveryPrice);
      }

      console.log("💰 Final delivery price:", deliveryPrice);
      const timing = deliveryData.timing || "Standard";
      const urgency = deliveryData.urgency || "NORMAL";

      console.log("🔍 Extracted delivery data for order creation:", {
        itemDescription,
        pickupAddress,
        deliveryAddress,
        deliveryPrice,
        timing,
        urgency,
      });

      const chatMetadata: any = getChatMetadata();

      deliveryPrice = chatMetadata.delivery_cost;

      if (deliveryPrice <= 0) {
        throw new Error("Invalid delivery price for order creation");
      }

      const currencyExchangeRate = await Logic.Wallet.GetGlobalExchangeRate(
        "USD",
        chatMetadata?.delivery_currency
      );

      deliveryPrice = deliveryPrice / currencyExchangeRate.mid;

      // ✅ Prepare delivery order data (following CreateDeliveryOrder API structure)
      const deliveryOrderData = {
        itemDescription,
        scheduledDate: deliveryData.scheduledDate || "",
        scheduledTime: deliveryData.scheduledTime || "",
        pickupAddress,
        deliveryAddress,
        note: deliveryData.note || "",
        deliveryPrice,
        urgency,
        estimatedDeliveryDate:
          urgency === "IMMEDIATE"
            ? new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString() // 2 hours from now
            : new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours from now
        paymentMethod: "greep_wallet",
        conversationId: conversationUuid || "",
      };

      try {
        // Set the payload in Logic for CreateDeliveryOrder
        // @ts-expect-error
        Logic.Order.CreateDeliveryOrderPayload = deliveryOrderData;
        // @ts-expect-error
        const createdOrder = await Logic.Order.CreateDeliveryOrder();

        if (createdOrder) {
          // ✅ Store order UUID/ID in reactive variable for immediate access
          if (createdOrder.id || createdOrder.uuid) {
            currentOrderId.value = String(createdOrder.id);
            currentOrderUuid.value = String(
              createdOrder.uuid || createdOrder.id
            );
            console.log(
              "✅ Delivery order UUID stored in reactive variable:",
              currentOrderUuid.value
            );
          }

          let currentMetadata: any = {};

          // ✅ Save order data to conversation metadata
          try {
            const conversationData = Logic.Messaging.SingleConversation;
            if (conversationData) {
              currentMetadata = conversationData.metadata
                ? JSON.parse(conversationData.metadata)
                : {};
              currentMetadata.delivery_order_id = createdOrder.id;
              currentMetadata.delivery_order_uuid = createdOrder.uuid;
              currentMetadata.delivery_order_data = deliveryOrderData;
              currentMetadata.delivery_order = createdOrder;
              // Store tracking information if available
              if ((createdOrder as any).trackingNumber) {
                currentMetadata.tracking_number = (
                  createdOrder as any
                ).trackingNumber;
              } else if ((createdOrder as any).tracking) {
                currentMetadata.tracking_number = (
                  createdOrder as any
                ).tracking;
              }
              conversationData.metadata = JSON.stringify(currentMetadata);
            }
          } catch (error) {
            console.error(
              "❌ Error storing delivery order data in metadata:",
              error
            );
          }

          console.log("✅ Delivery Order created successfully:", createdOrder);

          // ✅ Set order created flag
          orderCreated.value = true;

          // ✅ Enable direct messaging for everyone
          directMessagingEnabled.value = false;

          console.log(
            "🔍 DELIVERY ORDER CREATION - Message clearing decision:"
          );
          console.log("  📊 Current messages count:", messages.length);
          console.log("  👤 Business joined status:", businessJoined.value);

          // ✅ IMPORTANT: Send workflow message to trigger step transition (like P2P)
          console.log(
            "🎯 Sending delivery workflow transition message to backend"
          );
          const chatMetaData: any = getChatMetadata();

          isProcessing.value = false;

          currentMetadata.selected_option = "accept";
          chatMetaData.selected_option = "accept";

          await sendWorkflowMessage("{delivery_order_summary}", {
            ...currentMetadata,
            ...chatMetaData,
            selected_option: "accept",
          });

          return createdOrder;
        } else {
          throw new Error("Delivery order creation returned null");
        }
      } catch (apiError: any) {
        console.error("❌ API Error creating delivery order:", apiError);
        directMessagingEnabled.value = true;
        return null;
      }

      return null;
    } catch (error) {
      console.error("❌ Error creating delivery order:", error);
      // Enable direct messaging on error
      directMessagingEnabled.value = false;
      return null;
    } finally {
      isProcessing.value = false;
    }
  };

  // ✅ DEBUG: Watch for any changes to messages array length
  let lastMessageCount = 0;
  setInterval(() => {
    if (messages.length !== lastMessageCount) {
      console.log("🔍 MESSAGES ARRAY CHANGED:");
      console.log("  📊 Previous count:", lastMessageCount);
      console.log("  📊 New count:", messages.length);
      console.log("  📊 Difference:", messages.length - lastMessageCount);
      console.log(
        "  📝 Current messages:",
        messages.map((m: any) => ({
          id: m.id,
          content: m.content.substring(0, 30) + "...",
          isUser: m.sender?.uuid != "user",
          user_name: m.user_name,
        }))
      );
      console.trace("📍 Stack trace for message array change");
      lastMessageCount = messages.length;
    }
  }, 100); // Check every 100ms

  // Initialize message filtering
  const messageFiltering = useMessageFiltering({
    isBusinessUser: computed(() => isBusinessUser.value),
    AuthUser: ref(Logic.Auth.AuthUser),
    SingleConversation: ref(Logic.Messaging.SingleConversation),
    orderConfirmed,
    showAddressInput,
    proofUploaded,
    showPaymentConfirmation,
    startCountdown,
    scrollToBottom,
    messages: messages as any[],
  });

  // Update delivery status function
  const updateDeliveryStatus = async (
    orderId: string,
    status: string
  ): Promise<boolean> => {
    if (!orderId || !status) {
      console.error("❌ Missing orderId or status for updateDeliveryStatus");
      return false;
    }

    console.log("🔧 Updating delivery status:", { orderId, status });

    try {
      // Call the Logic.Order.UpdateDeliveryStatus method
      // @ts-expect-error
      const result = await Logic.Order.UpdateDeliveryStatus(orderId, status);

      if (result) {
        deliveryCompleted.value = true;
        console.log("✅ Delivery status updated successfully");
        return true;
      } else {
        console.error("❌ Failed to update delivery status");
        return false;
      }
    } catch (error) {
      console.error("❌ Error updating delivery status:", error);
      return false;
    }
  };

  return {
    // State
    messages,
    isProcessing,
    currentStage,
    isConnected,
    isBusinessUser,
    businessJoined,
    businessName, // Business name for header display
    directMessagingEnabled,

    // Computed
    expectedInput,
    activeModal,
    manualModalOverride,

    // Methods
    sendMessage,
    sendDirectMessage,
    sendRegularChatMessage,
    sendWorkflowMessage,
    addMessage,
    handleIncomingMessage,
    initializeFromConversation,
    initializeWorkflow,
    getLastAIMessage,
    buildStructuredResponse,
    handleBusinessJoined,
    detectBusinessUser,
    extractOrderSummary,
    formatOrderSummary,
    handleActionClick,
    createP2POrder,
    createDeliveryOrder,
    startCountdown,
    stopCountdown,
    countdownType,
    countdownTime,
    orderCreated,
    deliveryCompleted,
    currentOrderId,
    currentOrderUuid,
    releaseFunds,
    updateDeliveryStatus,
    handleProofUploadComplete,
    getChatMetadata,

    // Payment confirmation state
    showPaymentConfirmation,
  };
};

export const participantOwnExchangeAd = (
  participant: Participant,
  exchangeAd: ExchangeAd
) => {
  let businessOwnerId = exchangeAd?.business?.auth_user_id;

  let participantIsBusinessOwner = false;

  if (participant?.user_id?.toString() == businessOwnerId?.toString()) {
    participantIsBusinessOwner = true;
  }

  return participantIsBusinessOwner;
};

export const getChatMetadata = () => {
  let messagesMetadata = {};

  const messagesFromLocal = localStorage.getItem("messages_latest");

  if (messagesFromLocal) {
    try {
      const parsedMessages = JSON.parse(messagesFromLocal);
      parsedMessages.forEach((message: any) => {
        const metadata =
          typeof message.metadata == "string"
            ? JSON.parse(message.metadata || "{}")
            : message.metadata;
        messagesMetadata = {
          ...messagesMetadata,
          ...metadata,
          ...(metadata?.structured_response || {}),
        };
      });
      return messagesMetadata;
    } catch (error) {
      //
    }
  }

  Logic.Messaging.SingleConversation?.messages?.forEach((message) => {
    const metadata = JSON.parse(message.metadata || "{}");

    messagesMetadata = { ...messagesMetadata, ...metadata };
  });

  const conversationMetadata = JSON.parse(
    Logic.Messaging.SingleConversation?.metadata || "{}"
  );

  return {
    ...conversationMetadata,
    ...messagesMetadata,
  };
};
