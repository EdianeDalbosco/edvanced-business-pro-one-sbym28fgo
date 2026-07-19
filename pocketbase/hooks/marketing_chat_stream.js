routerAdd(
  'POST',
  '/backend/v1/marketing/chat-stream',
  async (e) => {
    try {
      const body = e.requestInfo().body || {}
      const userId = e.auth?.id
      if (!userId) return e.unauthorizedError('auth required')
      if (!body.message?.trim()) return e.badRequestError('message is required')

      const conv = $ai.agent('marketing-specialist').getOrCreateConversation({
        user_id: userId,
        id: body.conversation_id || null,
      })
      const iter = $ai.agent('marketing-specialist').chat({
        user_id: userId,
        conversation_id: conv.id,
        message: body.message,
        stream: true,
      })
      e.response.header().set('Content-Type', 'text/event-stream')
      e.response.header().set('Cache-Control', 'no-cache')
      e.response.header().set('X-Conversation-Id', conv.id)
      await $response.stream(e, iter)
    } catch (err) {
      if (err instanceof SkipAiConfigError)
        return e.json(503, { error: 'AI temporariamente indisponivel' })
      if (err instanceof SkipAiAgentsError) {
        const status = err.status || 500
        return e.json(status, { error: status >= 500 ? 'falha no agente' : err.message })
      }
      if (err instanceof SkipAiError) {
        const status = err.status || 502
        return e.json(status, {
          error: status >= 500 ? 'AI temporariamente indisponivel' : err.message,
        })
      }
      throw err
    }
  },
  $apis.requireAuth(),
)
