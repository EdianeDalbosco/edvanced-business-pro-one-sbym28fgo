import pb from '@/lib/pocketbase/client'

export const getContacts = () => pb.collection('contacts').getFullList({ sort: '-created' })
export const createContact = (data: any) => {
  const token =
    Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
  return pb
    .collection('contacts')
    .create({ ...data, portal_token: token, user_id: pb.authStore.record?.id })
}
export const updateContact = (id: string, data: any) => pb.collection('contacts').update(id, data)
export const deleteContact = (id: string) => pb.collection('contacts').delete(id)
