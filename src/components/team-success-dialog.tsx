import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { CheckCircle2, Link2, MessageSquareText } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  memberName: string
}

const LOGIN_URL = 'https://edvanced-businessproone.goskip.app'
const GOLD = '#D4AF37'

export function TeamSuccessDialog({ open, onOpenChange, memberName }: Props) {
  const { toast } = useToast()
  const [copiedLink, setCopiedLink] = useState(false)
  const [copiedInvite, setCopiedInvite] = useState(false)

  const inviteMessage = `Olá ${memberName}, seja bem-vindo(a) ao Edvanced Business Pro! Seu acesso já está disponível. Você pode entrar na plataforma através do link: ${LOGIN_URL}`

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      return true
    } catch {
      try {
        const textarea = document.createElement('textarea')
        textarea.value = text
        textarea.style.position = 'fixed'
        textarea.style.opacity = '0'
        document.body.appendChild(textarea)
        textarea.select()
        document.execCommand('copy')
        document.body.removeChild(textarea)
        return true
      } catch {
        return false
      }
    }
  }

  const handleCopyLink = async () => {
    const ok = await copyToClipboard(LOGIN_URL)
    if (ok) {
      setCopiedLink(true)
      toast({ title: 'Copiado para a área de transferência!' })
      setTimeout(() => setCopiedLink(false), 2000)
    }
  }

  const handleCopyInvite = async () => {
    const ok = await copyToClipboard(inviteMessage)
    if (ok) {
      setCopiedInvite(true)
      toast({ title: 'Copiado para a área de transferência!' })
      setTimeout(() => setCopiedInvite(false), 2000)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div
            className="flex items-center justify-center w-14 h-14 mx-auto rounded-full mb-2"
            style={{ backgroundColor: `${GOLD}20` }}
          >
            <CheckCircle2 className="h-8 w-8" style={{ color: GOLD }} />
          </div>
          <DialogTitle className="text-center text-xl font-bold">
            Membro Adicionado com Sucesso!
          </DialogTitle>
          <DialogDescription className="text-center">
            <span className="font-semibold text-foreground">{memberName}</span> foi adicionado à
            equipe. Compartilhe as instruções de acesso abaixo.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-2">
          <div className="rounded-lg border border-border bg-muted/40 p-3">
            <p className="text-xs font-medium text-muted-foreground mb-1">Link de Acesso</p>
            <p className="text-sm text-foreground break-all select-all">{LOGIN_URL}</p>
          </div>

          <div className="rounded-lg border border-border bg-muted/40 p-3">
            <p className="text-xs font-medium text-muted-foreground mb-2">Mensagem de Convite</p>
            <p className="text-sm text-foreground leading-relaxed">{inviteMessage}</p>
          </div>

          <div className="flex flex-col gap-2">
            <Button
              variant="outline"
              className="w-full justify-start border-[#D4AF37]/40 hover:bg-[#D4AF37]/10 hover:border-[#D4AF37]"
              onClick={handleCopyLink}
            >
              {copiedLink ? (
                <CheckCircle2 className="mr-2 h-4 w-4" style={{ color: GOLD }} />
              ) : (
                <Link2 className="mr-2 h-4 w-4" style={{ color: GOLD }} />
              )}
              Copiar Link de Acesso
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start border-[#D4AF37]/40 hover:bg-[#D4AF37]/10 hover:border-[#D4AF37]"
              onClick={handleCopyInvite}
            >
              {copiedInvite ? (
                <CheckCircle2 className="mr-2 h-4 w-4" style={{ color: GOLD }} />
              ) : (
                <MessageSquareText className="mr-2 h-4 w-4" style={{ color: GOLD }} />
              )}
              Copiar Convite Completo
            </Button>
          </div>

          <Button
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
            onClick={() => onOpenChange(false)}
          >
            Fechar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
