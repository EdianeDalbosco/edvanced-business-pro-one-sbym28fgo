import pb from '@/lib/pocketbase/client'

export const getTransactions = () => pb.collection('finance').getFullList({ sort: '-date' })
export const createTransaction = (data: any) =>
  pb.collection('finance').create({ ...data, user_id: pb.authStore.record?.id })
export const updateTransaction = (id: string, data: any) =>
  pb.collection('finance').update(id, data)
export const deleteTransaction = (id: string) => pb.collection('finance').delete(id)
