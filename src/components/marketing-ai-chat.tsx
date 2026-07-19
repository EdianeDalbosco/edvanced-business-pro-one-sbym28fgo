import { useState, useRef, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { streamMarketingChat } from '@/services/marketing-agent'
import { streamAgentChat, type DisplayMessage } from '@/lib/skipAi'
import { Send, Sparkles, Bot, User } from 'lucide-react'
import { cn } from '@/lib/utils'

const SUGGESTIONS = [
  'Gere uma estratégia de conteúdo para Instagram desta semana',
  'Crie 3 legendas para um post sobre consultoria empresarial',
  'Sugira um calendário de publicações para o LinkedIn',
  'Escreva um título cativante para uma campanha de Black Friday',
]

export function MarketingAiChat() {
  const [messages, setMessages] = useState<DisplayMessage[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [conversationId, setConversationId] = useState<string | null>(null)
  const abortRef = useRef<AbortController | null>(null)

  const send = useCallback(
    async (text: string) => {
      if (!text.trim() || loading) return
      const userMsg: DisplayMessage = {
        id: crypto.randomUUID(),
        role: 'user',
        content: text,
        created: new Date().toISOString(),
      }
      const assistantId = crypto.randomUUID()
      setMessages((prev) => [
        ...prev,
        userMsg,
        { id: assistantId, role: 'assistant', content: '', created: new Date().toISOString() },
      ])
      setInput('')
      setLoading(true)
      const controller = new AbortController()
      abortRef.current = controller
      try {
        const res = await streamMarketingChat(text, conversationId, controller.signal)
        const convId = res.headers.get('X-Conversation-Id')
        if (convId) setConversationId(convId)
        await streamAgentChat(res, {
          onChunk: (_delta, full) => {
            setMessages((prev) =>
              prev.map((m) => (m.id === assistantId ? { ...m, content: full } : m)),
            )
          },
          signal: controller.signal,
        })
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantId
                ? { ...m, content: 'Erro ao gerar resposta. Tente novamente.' }
                : m,
            ),
          )
        }
      } finally {
        setLoading(false)
        abortRef.current = null
      }
    },
    [loading, conversationId],
  )

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      send(input)
    }
  }

  return (
    <div className="flex flex-col h-[calc(100vh-220px)] min-h-[500px]">
      <Card className="border-border flex-1 flex flex-col overflow-hidden">
        <CardContent className="flex-1 flex flex-col p-0">
          <div className="flex items-center gap-2 p-4 border-b border-border">
            <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
              <Sparkles className="text-primary" size={20} />
            </div>
            <div>
              <div className="font-semibold text-foreground">Estrategista de Marketing AI</div>
              <div className="text-xs text-muted-foreground">
                Gere estratégias, legendas e calendários de conteúdo
              </div>
            </div>
          </div>
          <ScrollArea className="flex-1 p-4">
            {messages.length === 0 ? (
              <div className="space-y-3 max-w-lg mx-auto mt-8">
                <p className="text-center text-muted-foreground mb-4">
                  Como posso ajudar com seu marketing hoje?
                </p>
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    onClick={() => send(s)}
                    disabled={loading}
                    className="w-full text-left p-3 rounded-lg border border-border hover:border-primary/50 hover:bg-primary/5 transition-colors text-sm text-foreground"
                  >
                    {s}
                  </button>
                ))}
              </div>
            ) : (
              <div className="space-y-4 max-w-2xl mx-auto">
                {messages.map((m) => (
                  <div
                    key={m.id}
                    className={cn(
                      'flex gap-3',
                      m.role === 'user' ? 'justify-end' : 'justify-start',
                    )}
                  >
                    {m.role === 'assistant' && (
                      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                        <Bot size={18} className="text-primary" />
                      </div>
                    )}
                    <div
                      className={cn(
                        'rounded-xl px-4 py-2.5 max-w-[80%]',
                        m.role === 'user'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted text-foreground',
                      )}
                    >
                      <p className="text-sm whitespace-pre-wrap">{m.content || '...'}</p>
                    </div>
                    {m.role === 'user' && (
                      <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center shrink-0">
                        <User size={18} className="text-muted-foreground" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
          <div className="p-4 border-t border-border">
            <div className="flex gap-2 max-w-2xl mx-auto">
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKey}
                placeholder="Digite sua mensagem..."
                rows={1}
                disabled={loading}
                className="resize-none min-h-[44px] max-h-32"
              />
              <Button
                onClick={() => send(input)}
                disabled={loading || !input.trim()}
                size="icon"
                className="bg-primary text-primary-foreground hover:bg-primary/90 shrink-0"
              >
                <Send size={18} />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
