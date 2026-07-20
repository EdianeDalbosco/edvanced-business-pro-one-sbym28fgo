import pb from '@/lib/pocketbase/client'
import { getAvatarUrl } from '@/services/users'

export interface TeamMember {
  id: string
  name: string
  email: string
  phone: string
  role: string
  avatar: string
}

export async function getTeamMembers(): Promise<TeamMember[]> {
  const records = await pb.collection('users').getFullList({ sort: 'name' })
  return records.map((r) => ({
    id: r.id,
    name: r.name || '',
    email: r.email || '',
    phone: r.phone || '',
    role: r.role || 'member',
    avatar: r.avatar || '',
  }))
}

export async function createTeamMember(data: {
  name: string
  email: string
  password: string
  phone: string
  role: string
}): Promise<string> {
  const record = await pb.collection('users').create({
    email: data.email,
    password: data.password,
    passwordConfirm: data.password,
    name: data.name,
    phone: data.phone,
    role: data.role,
  })

  const managerId = pb.authStore.record?.id
  if (managerId) {
    try {
      await pb.collection('team_events').create({
        target_user_id: record.id,
        manager_id: managerId,
        action: 'member_added',
        details: `Novo membro "${data.name}" adicionado à equipe como ${data.role === 'manager' ? 'Gerente' : 'Membro'}.`,
      })
    } catch (err) {
      console.error('Failed to log team event:', err)
    }
  }

  return record.id
}

export async function updateTeamMember(
  id: string,
  data: { name: string; phone: string; role: string },
): Promise<void> {
  let oldRole = ''
  try {
    const existing = await pb.collection('users').getOne(id)
    oldRole = existing.role || 'member'
  } catch {
    /* intentionally ignored */
  }

  await pb.collection('users').update(id, data)

  if (oldRole && oldRole !== data.role) {
    const managerId = pb.authStore.record?.id
    if (managerId) {
      try {
        await pb.collection('team_events').create({
          target_user_id: id,
          manager_id: managerId,
          action: 'role_changed',
          details: `Função alterada de ${oldRole === 'manager' ? 'Gerente' : 'Membro'} para ${data.role === 'manager' ? 'Gerente' : 'Membro'}.`,
        })
      } catch (err) {
        console.error('Failed to log team event:', err)
      }
    }
  }
}

export async function deleteTeamMember(id: string): Promise<void> {
  let memberName = ''
  try {
    const member = await pb.collection('users').getOne(id)
    memberName = member.name || ''
  } catch {
    /* intentionally ignored */
  }

  const managerId = pb.authStore.record?.id
  if (managerId) {
    try {
      await pb.collection('team_events').create({
        target_user_id: id,
        manager_id: managerId,
        action: 'member_removed',
        details: `Membro "${memberName || 'Desconhecido'}" removido da equipe.`,
      })
    } catch (err) {
      console.error('Failed to log team event:', err)
    }
  }

  await pb.collection('users').delete(id)
}

export function getMemberAvatarUrl(member: TeamMember): string {
  return getAvatarUrl(member.id, member.avatar)
}
