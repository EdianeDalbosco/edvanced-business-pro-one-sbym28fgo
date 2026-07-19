import pb from '@/lib/pocketbase/client'

export const getGoals = () => pb.collection('goals').getFullList({ sort: '-created' })
export const createGoal = (data: any) =>
  pb.collection('goals').create({ ...data, user_id: pb.authStore.record?.id })
export const updateGoal = (id: string, data: any) => pb.collection('goals').update(id, data)
export const deleteGoal = (id: string) => pb.collection('goals').delete(id)
