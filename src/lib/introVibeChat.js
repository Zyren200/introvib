import {
  getStoredSessionToken,
  isApiOnlyMode,
  isApiUnavailableError,
  isRemoteAuthEnabled,
  requestIntroVibeApi,
} from "./introVibeApi";

export const DIRECT_CHAT_KEY = "introVibeDirectChats";
export const GROUP_CHAT_KEY = "introVibeGroupChats";

export const getDirectChatKey = (firstUserId, secondUserId) =>
  [firstUserId, secondUserId].sort().join(":");

export const loadLegacyDirectChats = () => {
  try {
    const raw = localStorage.getItem(DIRECT_CHAT_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch (error) {
    console.error("Failed to load direct chats", error);
    return {};
  }
};

export const loadLegacyGroupChats = () => {
  try {
    const raw = localStorage.getItem(GROUP_CHAT_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (error) {
    console.error("Failed to load group chats", error);
    return [];
  }
};

export const persistLegacyDirectChats = (value) => {
  try {
    localStorage.setItem(DIRECT_CHAT_KEY, JSON.stringify(value));
  } catch (error) {
    console.error("Failed to save direct chats", error);
  }
};

export const persistLegacyGroupChats = (value) => {
  try {
    localStorage.setItem(GROUP_CHAT_KEY, JSON.stringify(value));
  } catch (error) {
    console.error("Failed to save group chats", error);
  }
};

export const shouldUseRemoteChat = (authMode, currentUserId) =>
  Boolean(currentUserId) &&
  (authMode === "railway-api" || (isRemoteAuthEnabled() && getStoredSessionToken()));

export const shouldFallbackToLegacyChat = (error) =>
  isRemoteAuthEnabled() && !isApiOnlyMode() && isApiUnavailableError(error);

export const fetchRemoteChatState = async () => requestIntroVibeApi("/api/chat/state");

export const sendRemoteDirectMessage = async (peerId, payload) =>
  requestIntroVibeApi("/api/chat/direct/send", {
    method: "POST",
    body: JSON.stringify({
      peerId,
      ...(typeof payload === "string" ? { text: payload } : payload),
    }),
  });

export const markRemoteDirectRead = async (peerId) =>
  requestIntroVibeApi("/api/chat/direct/read", {
    method: "POST",
    body: JSON.stringify({ peerId }),
  });

export const createRemoteGroup = async (name, memberIds) =>
  requestIntroVibeApi("/api/chat/groups/create", {
    method: "POST",
    body: JSON.stringify({ name, memberIds }),
  });

export const sendRemoteGroupMessage = async (groupId, payload) =>
  requestIntroVibeApi("/api/chat/groups/send", {
    method: "POST",
    body: JSON.stringify({
      groupId,
      ...(typeof payload === "string" ? { text: payload } : payload),
    }),
  });

export const markRemoteGroupRead = async (groupId) =>
  requestIntroVibeApi("/api/chat/groups/read", {
    method: "POST",
    body: JSON.stringify({ groupId }),
  });
