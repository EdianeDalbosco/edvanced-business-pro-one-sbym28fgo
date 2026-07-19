import pb from '@/lib/pocketbase/client'

export const getPlanning = async () => {
  try {
    const list = await pb.collection('business_planning').getFullList()
    return list[0] || null
  } catch {
    return null
  }
}
export const savePlanning = async (id: string | undefined, data: any) => {
  if (id) return pb.collection('business_planning').update(id, data)
  return pb.collection('business_planning').create({ ...data, user_id: pb.authStore.record?.id })
}
