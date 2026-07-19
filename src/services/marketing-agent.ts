import pb from '@/lib/pocketbase/client'

export const chatWithMarketingAgent = (message: string, conversationId: string | null) =>
  pb.send('/backend/v1/marketing/chat', {
    method: 'POST',
    body: JSON.stringify({ message, conversation_id: conversationId }),
    headers: { 'Content-Type': 'application/json' },
  })

export const streamMarketingChat = (
  message: string,
  conversationId: string | null,
  signal: AbortSignal,
): Promise<Response> =>
  fetch(`${import.meta.env.VITE_POCKETBASE_URL}/backend/v1/marketing/chat-stream`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: pb.authStore.token || '' },
    body: JSON.stringify({ message, conversation_id: conversationId }),
    signal,
  })

export const getMarketingConversations = () =>
  pb.send('/backend/v1/marketing/chats', { method: 'GET' })

export const getMarketingMessages = (conversationId: string) =>
  pb.send(`/backend/v1/marketing/chats/${conversationId}/messages`, { method: 'GET' })
