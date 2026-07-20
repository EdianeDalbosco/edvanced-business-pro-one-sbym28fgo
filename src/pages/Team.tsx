import { useEffect, useState, useMemo } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  getTeamMembers,
  deleteTeamMember,
  getMemberAvatarUrl,
  type TeamMember,
} from '@/services/team'
import { useRealtime } from '@/hooks/use-realtime'
import { useToast } from '@/hooks/use-toast'
import { useAuth } from '@/hooks/use-auth'
import { TeamMemberForm } from '@/components/team-member-form'
import { TeamHistorySheet } from '@/components/team-history-sheet'
import { getTeamEvents } from '@/services/team-events'
import { TeamMemberGoals } from '@/components/team-member-goals'
import { TeamGoalForm } from '@/components/team-goal-form'
import { getTeamGoals } from '@/services/team-goals'
import { Plus, Search, Pencil, Trash2, Shield, User, History } from 'lucide-react'

const roleLabel = (r: string) => (r === 'manager' ? 'Gerente' : 'Membro')

export default function Team() {
  const [members, setMembers] = useState<TeamMember[]>([])
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<TeamMember | null>(null)
  const [search, setSearch] = useState('')
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deleting, setDeleting] = useState<TeamMember | null>(null)
  const [historyOpen, setHistoryOpen] = useState(false)
  const [events, setEvents] = useState<any[]>([])
  const [goals, setGoals] = useState<any[]>([])
  const [goalFormOpen, setGoalFormOpen] = useState(false)
  const [goalMember, setGoalMember] = useState<TeamMember | null>(null)
  const { toast } = useToast()
  const { user } = useAuth()

  const loadData = async () => setMembers(await getTeamMembers())
  const loadEvents = async () => {
    if (user?.role !== 'manager') return
    try {
      setEvents(await getTeamEvents())
    } catch (e) {
      console.error(e)
    }
  }
  const loadGoals = async () => {
    if (user?.role !== 'manager') return
    try {
      setGoals(await getTeamGoals())
    } catch (e) {
      console.error(e)
    }
  }
  useEffect(() => {
    loadData()
    loadEvents()
    loadGoals()
  }, [user?.role])
  useRealtime('users', loadData)
  useRealtime('team_events', loadEvents)
  useRealtime('tasks', loadData)
  useRealtime('goals', loadGoals)

  const filtered = useMemo(
    () =>
      members.filter(
        (m) =>
          m.name?.toLowerCase().includes(search.toLowerCase()) ||
          m.email?.toLowerCase().includes(search.toLowerCase()),
      ),
    [members, search],
  )

  const openCreate = () => {
    setEditing(null)
    setFormOpen(true)
  }
  const openEdit = (m: TeamMember) => {
    setEditing(m)
    setFormOpen(true)
  }
  const openAddGoal = (m: TeamMember) => {
    setGoalMember(m)
    setGoalFormOpen(true)
  }

  const handleDelete = async () => {
    if (!deleting) return
    try {
      await deleteTeamMember(deleting.id)
      setDeleteOpen(false)
      toast({ title: 'Membro removido com sucesso!' })
    } catch {
      toast({ title: 'Erro ao remover membro', variant: 'destructive' })
    }
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Equipe</h1>
          <p className="text-muted-foreground">Gerencie os membros da sua equipe e seus acessos.</p>
        </div>
        <div className="flex gap-2">
          {user?.role === 'manager' && (
            <Button
              variant="outline"
              onClick={() => setHistoryOpen(true)}
              className="border-primary/30 text-primary hover:bg-primary/10"
            >
              <History className="mr-2 h-4 w-4" /> Histórico
            </Button>
          )}
          <Button
            onClick={openCreate}
            className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-md shadow-primary/20"
          >
            <Plus className="mr-2 h-4 w-4" /> Novo Membro
          </Button>
        </div>
      </div>

      <div className="relative">
        <Search
          className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          size={18}
        />
        <Input
          placeholder="Buscar por nome ou email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      <Card className="border-border">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow className="border-border hover:bg-muted/30">
              <TableHead className="text-muted-foreground">Nome</TableHead>
              <TableHead className="text-muted-foreground">Email</TableHead>
              <TableHead className="text-muted-foreground">Telefone</TableHead>
              <TableHead className="text-muted-foreground">Função</TableHead>
              <TableHead className="w-[100px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                  Nenhum membro encontrado.
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((m) => (
                <TableRow key={m.id} className="border-border">
                  <TableCell className="font-medium text-foreground">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9">
                        {m.avatar ? <AvatarImage src={getMemberAvatarUrl(m)} alt={m.name} /> : null}
                        <AvatarFallback className="bg-primary/10 text-primary text-sm">
                          {m.name?.charAt(0)?.toUpperCase() || '?'}
                        </AvatarFallback>
                      </Avatar>
                      <span>{m.name || 'Sem nome'}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{m.email}</TableCell>
                  <TableCell className="text-muted-foreground">{m.phone || '-'}</TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={
                        m.role === 'manager'
                          ? 'border-primary/30 text-primary'
                          : 'border-muted-foreground/30 text-muted-foreground'
                      }
                    >
                      {m.role === 'manager' ? (
                        <Shield size={12} className="mr-1" />
                      ) : (
                        <User size={12} className="mr-1" />
                      )}
                      {roleLabel(m.role)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openEdit(m)}
                        className="text-muted-foreground hover:text-primary"
                      >
                        <Pencil size={16} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setDeleting(m)
                          setDeleteOpen(true)
                        }}
                        className="text-muted-foreground hover:text-rose-500"
                        disabled={m.id === user?.id}
                      >
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      <TeamMemberForm
        open={formOpen}
        onOpenChange={setFormOpen}
        onSaved={() => {
          loadData()
          loadEvents()
        }}
        editing={editing}
      />

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover Membro</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja remover este membro? Esta ação não pode ser desfeita e o acesso
              será revogado imediatamente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-500 hover:bg-red-600 text-white"
            >
              Remover
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {user?.role === 'manager' && (
        <TeamMemberGoals members={filtered} goals={goals} onAddGoal={openAddGoal} />
      )}

      <TeamGoalForm
        open={goalFormOpen}
        onOpenChange={setGoalFormOpen}
        onSaved={loadGoals}
        member={goalMember}
      />

      <TeamHistorySheet open={historyOpen} onOpenChange={setHistoryOpen} events={events} />
    </div>
  )
}
