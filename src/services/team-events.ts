import pb from '@/lib/pocketbase/client'

export interface TeamEvent {
  id: string
  target_user_id: string
  manager_id: string
  action: string
  details: string
  created: string
  updated: string
  expand?: {
    target_user_id?: { id: string; name: string; email: string }
    manager_id?: { id: string; name: string; email: string }
  }
}

export const getTeamEvents = () =>
  pb.collection('team_events').getFullList({
    sort: '-created',
    expand: 'target_user_id,manager_id',
  })

export const createTeamEvent = (data: {
  target_user_id: string
  manager_id: string
  action: string
  details: string
}) => pb.collection('team_events').create(data)
