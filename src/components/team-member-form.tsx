import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { createTeamMember, updateTeamMember, type TeamMember } from '@/services/team'
import { useToast } from '@/hooks/use-toast'
import { extractFieldErrors, getErrorMessage, type FieldErrors } from '@/lib/pocketbase/errors'
import { TeamSuccessDialog } from '@/components/team-success-dialog'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSaved: () => void
  editing: TeamMember | null
}

const emptyForm = {
  name: '',
  email: '',
  password: '',
  phone: '',
  role: 'member',
}

export function TeamMemberForm({ open, onOpenChange, onSaved, editing }: Props) {
  const { toast } = useToast()
  const [form, setForm] = useState({ ...emptyForm })
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
  const [successOpen, setSuccessOpen] = useState(false)
  const [createdName, setCreatedName] = useState('')

  useEffect(() => {
    if (editing) {
      setForm({
        name: editing.name,
        email: editing.email,
        password: '',
        phone: editing.phone,
        role: editing.role || 'member',
      })
    } else {
      setForm({ ...emptyForm })
    }
    setFieldErrors({})
  }, [editing, open])

  const update = (key: string, val: string) => setForm((prev) => ({ ...prev, [key]: val }))

  const handleSubmit = async () => {
    setFieldErrors({})

    const errors: FieldErrors = {}
    if (!form.name.trim()) errors.name = 'Nome é obrigatório'
    if (!form.email.trim()) {
      errors.email = 'Email é obrigatório'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      errors.email = 'Email inválido'
    }
    if (!editing && form.password.length < 8) {
      errors.password = 'A senha deve ter no mínimo 8 caracteres'
    }
    if (!form.phone.trim()) errors.phone = 'Telefone é obrigatório'

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors)
      return
    }

    try {
      if (editing) {
        await updateTeamMember(editing.id, {
          name: form.name,
          phone: form.phone,
          role: form.role,
        })
        toast({ title: 'Membro atualizado com sucesso!' })
        onOpenChange(false)
        onSaved()
      } else {
        await createTeamMember(form)
        setCreatedName(form.name)
        onOpenChange(false)
        onSaved()
        setSuccessOpen(true)
      }
    } catch (err) {
      const serverErrors = extractFieldErrors(err)
      if (serverErrors.email && serverErrors.email.toLowerCase().includes('unique')) {
        serverErrors.email = 'Este email já está em uso'
      }
      setFieldErrors(serverErrors)
      toast({ title: getErrorMessage(err), variant: 'destructive' })
    }
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editing ? 'Editar Membro' : 'Adicionar Membro'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Nome Completo *</Label>
              <Input value={form.name} onChange={(e) => update('name', e.target.value)} />
              {fieldErrors.name && <p className="text-sm text-red-500">{fieldErrors.name}</p>}
            </div>
            <div className="space-y-2">
              <Label>Email *</Label>
              <Input
                type="email"
                value={form.email}
                onChange={(e) => update('email', e.target.value)}
                disabled={!!editing}
                placeholder={editing ? 'Não é possível alterar o email' : ''}
              />
              {fieldErrors.email && <p className="text-sm text-red-500">{fieldErrors.email}</p>}
            </div>
            {!editing && (
              <div className="space-y-2">
                <Label>Senha *</Label>
                <Input
                  type="password"
                  value={form.password}
                  onChange={(e) => update('password', e.target.value)}
                  placeholder="Mínimo 8 caracteres"
                />
                {fieldErrors.password && (
                  <p className="text-sm text-red-500">{fieldErrors.password}</p>
                )}
              </div>
            )}
            <div className="space-y-2">
              <Label>Telefone *</Label>
              <Input value={form.phone} onChange={(e) => update('phone', e.target.value)} />
              {fieldErrors.phone && <p className="text-sm text-red-500">{fieldErrors.phone}</p>}
            </div>
            <div className="space-y-2">
              <Label>Função *</Label>
              <Select value={form.role} onValueChange={(v) => update('role', v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a função" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="manager">Gerente</SelectItem>
                  <SelectItem value="member">Membro</SelectItem>
                </SelectContent>
              </Select>
              {fieldErrors.role && <p className="text-sm text-red-500">{fieldErrors.role}</p>}
            </div>
            <Button
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
              onClick={handleSubmit}
            >
              {editing ? 'Salvar Alterações' : 'Adicionar Membro'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <TeamSuccessDialog
        open={successOpen}
        onOpenChange={setSuccessOpen}
        memberName={createdName}
      />
    </>
  )
}
