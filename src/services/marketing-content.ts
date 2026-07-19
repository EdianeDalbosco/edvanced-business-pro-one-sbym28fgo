import pb from '@/lib/pocketbase/client'

export const getMarketingContent = (campaignId?: string) => {
  const opts: Record<string, any> = { sort: '-created' }
  if (campaignId) opts.filter = `campaign_id = "${campaignId}"`
  return pb.collection('marketing_content').getFullList(opts)
}

export const createMarketingContent = (data: FormData) =>
  pb.collection('marketing_content').create(data)

export const updateMarketingContent = (id: string, data: FormData) =>
  pb.collection('marketing_content').update(id, data)

export const deleteMarketingContent = (id: string) => pb.collection('marketing_content').delete(id)

export const getMediaFileUrl = (record: any, filename: string) =>
  `${import.meta.env.VITE_POCKETBASE_URL}/api/files/${record.collectionId}/${record.id}/${filename}`
