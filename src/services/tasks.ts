import pb from '@/lib/pocketbase/client'

export const getTasks = () => pb.collection('tasks').getFullList({ sort: 'due_date' })
export const createTask = (data: any) =>
  pb.collection('tasks').create({ ...data, user_id: pb.authStore.record?.id })
export const updateTask = (id: string, data: any) => pb.collection('tasks').update(id, data)
export const getTasksByContact = (contactId: string) =>
  pb.collection('tasks').getFullList({
    filter: `contact_id = "${contactId}" && status != 'done'`,
    sort: 'due_date',
  })

export const deleteTask = (id: string) => pb.collection('tasks').delete(id)
