import pb from '@/lib/pocketbase/client'

export const getContracts = () =>
  pb.collection('contracts').getFullList({ sort: '-created', expand: 'contact_id' })
export const createContract = (data: FormData) => {
  data.append('user_id', pb.authStore.record?.id || '')
  return pb.collection('contracts').create(data)
}
export const updateContract = (id: string, data: any) => pb.collection('contracts').update(id, data)
export const deleteContract = (id: string) => pb.collection('contracts').delete(id)
