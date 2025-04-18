export interface Task {
  id: string
  title: string
  description: string
  status: 'todo' | 'in_progress' | 'done'
  startDate: Date
  endDate: Date
  assignee?: string
}

export interface Column {
  id: string
  title: string
  tasks: Task[]
}
