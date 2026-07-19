import pb from '@/lib/pocketbase/client'

export const getCampaigns = () => pb.collection('campaigns').getFullList({ sort: '-created' })
export const createCampaign = (data: any) =>
  pb.collection('campaigns').create({ ...data, user_id: pb.authStore.record?.id })
export const updateCampaign = (id: string, data: any) => pb.collection('campaigns').update(id, data)
export const deleteCampaign = (id: string) => pb.collection('campaigns').delete(id)
