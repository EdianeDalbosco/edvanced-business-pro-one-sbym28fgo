import pb from '@/lib/pocketbase/client'

export interface MemberProductivity {
  id: string
  name: string
  email: string
  role: string
  avatar: string
  totalTasks: number
  completedTasks: number
  completionRate: number
}

export interface RecentActivity {
  id: string
  type: 'task' | 'interaction'
  title?: string
  status?: string
  description?: string
  interaction_type?: string
  created: string
  user_id: string
  user_name: string
}

export const getTeamProductivity = (): Promise<MemberProductivity[]> =>
  pb.send('/backend/v1/team/productivity', { method: 'GET' })

export const getRecentTeamActivity = (): Promise<RecentActivity[]> =>
  pb.send('/backend/v1/team/recent-activity', { method: 'GET' })
