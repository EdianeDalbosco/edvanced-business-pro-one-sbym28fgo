import pb from '@/lib/pocketbase/client'

export const getTasks = () =>
  pb.collection('tasks').getFullList({
    sort: 'due_date',
    expand: 'contact_id,goal_id,contract_id',
  })

export const createTask = (data: any) =>
  pb.collection('tasks').create({ ...data, user_id: pb.authStore.record?.id })

export const updateTask = (id: string, data: any) => pb.collection('tasks').update(id, data)

export const deleteTask = (id: string) => pb.collection('tasks').delete(id)

export const getTasksByContact = (contactId: string) =>
  pb.collection('tasks').getFullList({
    filter: `contact_id = "${contactId}" && status != 'concluido'`,
    sort: 'due_date',
  })
