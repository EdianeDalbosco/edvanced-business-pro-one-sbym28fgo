import pb from '@/lib/pocketbase/client'

export interface TeamGoal {
  id: string
  user_id: string
  title: string
  target_value: number
  current_value: number
  initial_value: number
  deadline: string
  progress_percent: number
  priority: string
  status: string
  period_month: string
  indicator: string
  expand?: {
    user_id?: { id: string; name: string; email: string }
  }
}

export const getTeamGoals = () =>
  pb.collection('goals').getFullList({ sort: '-created', expand: 'user_id' }) as Promise<TeamGoal[]>

export const createTeamGoal = (data: {
  user_id: string
  title: string
  target_value: number
  deadline: string
  priority?: string
  indicator?: string
}) =>
  pb.collection('goals').create({
    user_id: data.user_id,
    title: data.title,
    target_value: data.target_value,
    initial_value: 0,
    current_value: 0,
    progress_percent: 0,
    deadline: data.deadline,
    status: 'nao_iniciada',
    priority: data.priority || 'medium',
    indicator: data.indicator || '',
  })

export const updateTeamGoal = (id: string, data: Partial<TeamGoal>) =>
  pb.collection('goals').update(id, data)

export const deleteTeamGoal = (id: string) => pb.collection('goals').delete(id)
