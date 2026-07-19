import { useState, useRef, useEffect } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { useToast } from '@/hooks/use-toast'
import { useRealtime } from '@/hooks/use-realtime'
import {
  getCurrentUser,
  updateProfile,
  changePassword,
  getAvatarUrl,
  type UserProfile,
} from '@/services/users'
import { extractFieldErrors, type FieldErrors } from '@/lib/pocketbase/errors'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { Camera, User as UserIcon, Lock, Mail, Phone, Loader2 } from 'lucide-react'

export default function Settings() {
  const { user } = useAuth()
  const { toast } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [profileLoading, setProfileLoading] = useState(false)
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})

  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordLoading, setPasswordLoading] = useState(false)
  const [passwordErrors, setPasswordErrors] = useState<FieldErrors>({})

  const loadProfile = async () => {
    try {
      const data = await getCurrentUser()
      setProfile(data)
      setName(data.name)
      setEmail(data.email)
      setPhone(data.phone)
    } catch {
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar o perfil.',
        variant: 'destructive',
      })
    }
  }

  useEffect(() => {
    loadProfile()
  }, [])

  useRealtime('users', (e) => {
    if (e.record.id === user?.id && e.action === 'update') {
      loadProfile()
    }
  })

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Erro',
        description: 'Selecione um arquivo de imagem válido.',
        variant: 'destructive',
      })
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: 'Erro',
        description: 'A imagem deve ter no máximo 5MB.',
        variant: 'destructive',
      })
      return
    }
    setAvatarFile(file)
    setAvatarPreview(URL.createObjectURL(file))
  }

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setProfileLoading(true)
    setFieldErrors({})
    try {
      await updateProfile({ name, email, phone }, avatarFile)
      toast({ title: 'Sucesso', description: 'Perfil atualizado com sucesso!' })
      setAvatarFile(null)
      setAvatarPreview(null)
      if (fileInputRef.current) fileInputRef.current.value = ''
      await loadProfile()
    } catch (err) {
      const errors = extractFieldErrors(err)
      setFieldErrors(errors)
      toast({
        title: 'Erro',
        description: 'Não foi possível atualizar o perfil.',
        variant: 'destructive',
      })
    } finally {
      setProfileLoading(false)
    }
  }

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setPasswordErrors({})
    if (newPassword !== confirmPassword) {
      setPasswordErrors({ confirmPassword: 'As senhas não coincidem.' })
      return
    }
    if (newPassword.length < 8) {
      setPasswordErrors({ newPassword: 'A senha deve ter no mínimo 8 caracteres.' })
      return
    }
    setPasswordLoading(true)
    try {
      await changePassword(currentPassword, newPassword)
      toast({ title: 'Sucesso', description: 'Senha alterada com sucesso!' })
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch (err) {
      const errors = extractFieldErrors(err)
      setPasswordErrors(errors)
      const message =
        Object.keys(errors).length > 0
          ? Object.values(errors).join(' ')
          : 'Não foi possível alterar a senha.'
      toast({ title: 'Erro', description: message, variant: 'destructive' })
    } finally {
      setPasswordLoading(false)
    }
  }

  const avatarUrl =
    avatarPreview || (profile?.avatar ? getAvatarUrl(profile.id, profile.avatar) : null)
  const initials = (name || email || '?').charAt(0).toUpperCase()

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in-up">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Configurações</h2>
        <p className="text-muted-foreground mt-1">Gerencie suas informações pessoais e segurança</p>
      </div>

      <Card className="border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <UserIcon size={20} className="text-primary" /> Perfil
          </CardTitle>
          <CardDescription>Atualize sua foto e dados pessoais</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleProfileSubmit} className="space-y-6">
            <div className="flex flex-col sm:flex-row items-center gap-6">
              <div
                className="relative group cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
              >
                <Avatar className="w-24 h-24 border-4 border-primary/20 shadow-lg">
                  {avatarUrl ? <AvatarImage src={avatarUrl} alt="Avatar" /> : null}
                  <AvatarFallback className="text-2xl font-bold bg-primary/10 text-primary">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <Camera size={24} className="text-white" />
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="hidden"
                />
              </div>
              <div className="text-center sm:text-left">
                <p className="text-sm font-medium text-foreground">Foto do Perfil</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Clique na imagem para alterar. JPG, PNG até 5MB.
                </p>
                {avatarFile && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="mt-2 text-destructive"
                    onClick={() => {
                      setAvatarFile(null)
                      setAvatarPreview(null)
                      if (fileInputRef.current) fileInputRef.current.value = ''
                    }}
                  >
                    Remover imagem
                  </Button>
                )}
              </div>
            </div>

            <Separator />

            <div className="space-y-2">
              <Label htmlFor="name" className="flex items-center gap-2">
                <UserIcon size={14} className="text-muted-foreground" /> Nome
              </Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Seu nome"
              />
              {fieldErrors.name && <p className="text-sm text-destructive">{fieldErrors.name}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center gap-2">
                <Mail size={14} className="text-muted-foreground" /> Email
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
              />
              {fieldErrors.email && <p className="text-sm text-destructive">{fieldErrors.email}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone" className="flex items-center gap-2">
                <Phone size={14} className="text-muted-foreground" /> Telefone
              </Label>
              <Input
                id="phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="(00) 00000-0000"
              />
              {fieldErrors.phone && <p className="text-sm text-destructive">{fieldErrors.phone}</p>}
            </div>

            <Button
              type="submit"
              disabled={profileLoading}
              className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-md shadow-primary/20"
            >
              {profileLoading ? (
                <>
                  <Loader2 size={16} className="mr-2 animate-spin" /> Salvando...
                </>
              ) : (
                'Salvar Alterações'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card className="border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Lock size={20} className="text-primary" /> Segurança
          </CardTitle>
          <CardDescription>Altere sua senha para manter sua conta segura</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="currentPassword">Senha Atual</Label>
              <Input
                id="currentPassword"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
              {passwordErrors.oldPassword && (
                <p className="text-sm text-destructive">{passwordErrors.oldPassword}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="newPassword">Nova Senha</Label>
              <Input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
                required
                minLength={8}
              />
              {passwordErrors.password && (
                <p className="text-sm text-destructive">{passwordErrors.password}</p>
              )}
              {passwordErrors.newPassword && (
                <p className="text-sm text-destructive">{passwordErrors.newPassword}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmar Nova Senha</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                required
                minLength={8}
              />
              {passwordErrors.confirmPassword && (
                <p className="text-sm text-destructive">{passwordErrors.confirmPassword}</p>
              )}
            </div>
            <Button
              type="submit"
              disabled={passwordLoading}
              className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-md shadow-primary/20"
            >
              {passwordLoading ? (
                <>
                  <Loader2 size={16} className="mr-2 animate-spin" /> Alterando...
                </>
              ) : (
                'Alterar Senha'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
