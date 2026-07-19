import pb from '@/lib/pocketbase/client'

export interface UserProfile {
  id: string
  name: string
  email: string
  phone: string
  avatar: string
}

export async function getCurrentUser(): Promise<UserProfile> {
  const record = await pb.collection('users').getOne(pb.authStore.record?.id || '')
  return {
    id: record.id,
    name: record.name || '',
    email: record.email || '',
    phone: record.phone || '',
    avatar: record.avatar || '',
  }
}

export function getAvatarUrl(userId: string, fileName: string): string {
  if (!fileName) return ''
  return `${import.meta.env.VITE_POCKETBASE_URL}/api/files/users/${userId}/${fileName}`
}

export async function updateProfile(
  data: { name: string; email: string; phone: string },
  avatarFile?: File | null,
): Promise<void> {
  const userId = pb.authStore.record?.id
  if (!userId) throw new Error('Not authenticated')

  const formData = new FormData()
  formData.append('name', data.name)
  formData.append('email', data.email)
  formData.append('phone', data.phone)
  if (avatarFile) {
    formData.append('avatar', avatarFile)
  }

  await pb.collection('users').update(userId, formData)

  if (data.email !== pb.authStore.record?.email) {
    await pb.collection('users').authRefresh()
  }
}

export async function changePassword(currentPassword: string, newPassword: string): Promise<void> {
  const userId = pb.authStore.record?.id
  if (!userId) throw new Error('Not authenticated')

  await pb.collection('users').update(userId, {
    oldPassword: currentPassword,
    password: newPassword,
    passwordConfirm: newPassword,
  })

  await pb.collection('users').authRefresh()
}
