import pb from '@/lib/pocketbase/client'

export const getContracts = () =>
  pb.collection('contracts').getFullList({ sort: '-created', expand: 'contact_id,product_id' })
export const createContract = (data: Record<string, any>, file?: File | null) => {
  const payload = { ...data, user_id: pb.authStore.record?.id }
  if (file) {
    const fd = new FormData()
    Object.entries(payload).forEach(([k, v]) => {
      if (v !== null && v !== undefined) fd.append(k, String(v))
    })
    fd.append('file', file)
    return pb.collection('contracts').create(fd)
  }
  return pb.collection('contracts').create(payload)
}
export const updateContract = (id: string, data: any) => pb.collection('contracts').update(id, data)
export const deleteContract = (id: string) => pb.collection('contracts').delete(id)
export const getContractFileUrl = (record: any) => {
  if (!record?.file) return null
  return `${pb.baseURL}/api/files/${record.collectionId}/${record.id}/${record.file}`
}
