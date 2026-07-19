import pb from '@/lib/pocketbase/client'

export const getInteractions = (contactId: string) =>
  pb.collection('client_interactions').getFullList({
    filter: `contact_id = "${contactId}"`,
    sort: '-date',
  })

export const createInteraction = (data: Record<string, any>) =>
  pb.collection('client_interactions').create({ ...data, user_id: pb.authStore.record?.id })

export const deleteInteraction = (id: string) => pb.collection('client_interactions').delete(id)
