import pb from '@/lib/pocketbase/client'

export interface TeamMember {
  id: string
  name: string
  email: string
  avatar: string
  phone: string
  role: string
  created: string
}

export interface TeamEvent {
  id: string
  target_user_id: string
  manager_id: string
  action: string
  details: string
  created: string
  expand?: {
    target_user_id?: { id: string; name: string; email: string }
    manager_id?: { id: string; name: string; email: string }
  }
}

export async function getTeamMembers(): Promise<TeamMember[]> {
  return await pb.collection('users').getFullList({ sort: 'created' })
}

export async function removeTeamMember(userId: string): Promise<void> {
  await pb.collection('users').delete(userId)
}

export async function createTeamMember(data: {
  name: string
  email: string
  password: string
  phone: string
  role: string
}): Promise<TeamMember> {
  return await pb.collection('users').create({
    name: data.name,
    email: data.email,
    password: data.password,
    passwordConfirm: data.password,
    phone: data.phone,
    role: data.role,
  })
}

export async function updateTeamMember(
  userId: string,
  data: { name?: string; phone?: string; role?: string },
): Promise<TeamMember> {
  return await pb.collection('users').update(userId, data)
}

export async function logTeamEvent(data: {
  target_user_id: string
  manager_id: string
  action: string
  details: string
}): Promise<void> {
  await pb.collection('team_events').create(data)
}

export async function getTeamEvents(): Promise<TeamEvent[]> {
  return await pb.collection('team_events').getFullList({
    sort: '-created',
    expand: 'target_user_id,manager_id',
  })
}
