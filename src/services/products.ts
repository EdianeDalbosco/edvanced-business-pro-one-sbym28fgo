import pb from '@/lib/pocketbase/client'

export const getProducts = () => pb.collection('products').getFullList({ sort: '-created' })
export const createProduct = (data: any) =>
  pb.collection('products').create({ ...data, user_id: pb.authStore.record?.id })
export const updateProduct = (id: string, data: any) => pb.collection('products').update(id, data)
export const deleteProduct = (id: string) => pb.collection('products').delete(id)
