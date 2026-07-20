import { useState, useEffect, useCallback } from 'react'
import { Trash2, Users, Pencil } from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'
import { useRealtime } from '@/hooks/use-realtime'
import { toast } from '@/hooks/use-toast'
import {
  getTeamMembers,
  removeTeamMember,
  logTeamEvent,
  getTeamEvents,
  type TeamMember,
  type TeamEvent,
} from '@/services/team'
import { getGoals } from '@/services/goals'
import { getAvatarUrl } from '@/services/users'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
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
import { Skeleton } from '@/components/ui/skeleton'
import { TeamGoalsSection } from '@/components/team-goals-section'
import { TeamActivityLog } from '@/components/team-activity-log'
import { TeamMemberForm } from '@/components/team-member-form'

export default function Team() {
  const { user } = useAuth()
  const [members, setMembers] = useState<TeamMember[]>([])
  const [events, setEvents] = useState<TeamEvent[]>([])
  const [goals, setGoals] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [memberToDelete, setMemberToDelete] = useState<TeamMember | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null)
  const [formOpen, setFormOpen] = useState(false)

  const loadData = useCallback(async () => {
    try {
      const [m, e, g] = await Promise.all([
        getTeamMembers(),
        getTeamEvents().catch(() => []),
        getGoals().catch(() => []),
      ])
      setMembers(m)
      setEvents(e)
      setGoals(g)
    } catch {
      toast({ title: 'Erro', description: 'Falha ao carregar dados.', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])
  useRealtime('users', () => {
    loadData()
  })
  useRealtime('team_events', () => {
    loadData()
  })
  useRealtime('goals', () => {
    loadData()
  })

  const handleConfirmDelete = async () => {
    if (!memberToDelete || !user) return
    setDeleting(true)
    try {
      await logTeamEvent({
        target_user_id: memberToDelete.id,
        manager_id: user.id,
        action: 'member_removed',
        details: `Member ${memberToDelete.name || memberToDelete.email} removed from the team by ${user.name || user.email}`,
      })
      await removeTeamMember(memberToDelete.id)
      toast({ title: 'Member successfully removed' })
      setMemberToDelete(null)
      loadData()
    } catch {
      toast({ title: 'Erro', description: 'Falha ao remover membro.', variant: 'destructive' })
    } finally {
      setDeleting(false)
    }
  }

  const isManager = user?.role === 'manager'

  if (loading) {
    return (
      <div className="space-y-6 p-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold">Equipe</h1>
        <p className="text-muted-foreground">Gerencie os membros da sua equipe</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Membros da Equipe
          </CardTitle>
          <CardDescription>{members.length} membros cadastrados</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Telefone</TableHead>
                <TableHead>Função</TableHead>
                {isManager && <TableHead className="text-right">Ações</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {members.map((member) => (
                <TableRow key={member.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        {member.avatar && (
                          <AvatarImage src={getAvatarUrl(member as any)} alt={member.name} />
                        )}
                        <AvatarFallback>
                          {(member.name || member.email || '?').charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <span className="font-medium">{member.name || 'Sem nome'}</span>
                    </div>
                  </TableCell>
                  <TableCell>{member.email}</TableCell>
                  <TableCell>{member.phone || '-'}</TableCell>
                  <TableCell>
                    <Badge variant={member.role === 'manager' ? 'default' : 'secondary'}>
                      {member.role === 'manager' ? 'Gerente' : 'Membro'}
                    </Badge>
                  </TableCell>
                  {isManager && (
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setEditingMember(member)
                            setFormOpen(true)
                          }}
                          title="Editar membro"
                        >
                          <Pencil className="h-4 w-4" style={{ color: '#D4AF37' }} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setMemberToDelete(member)}
                          disabled={member.id === user?.id}
                          title="Remover membro"
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <TeamGoalsSection members={members} goals={goals} />
      <TeamActivityLog events={events} />

      <TeamMemberForm
        open={formOpen}
        onOpenChange={(open) => {
          setFormOpen(open)
          if (!open) setEditingMember(null)
        }}
        onSaved={loadData}
        editing={editingMember}
      />

      <AlertDialog
        open={!!memberToDelete}
        onOpenChange={(open) => !open && setMemberToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover membro da equipe</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove this member? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault()
                handleConfirmDelete()
              }}
              disabled={deleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting ? 'Removendo...' : 'Confirm'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
