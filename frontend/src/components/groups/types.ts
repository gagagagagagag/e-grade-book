import { Student } from '../users/types'

export interface Group<T = string> {
  _id: string
  name: string
  students?: T[]
}

export interface GroupStudent extends Pick<Student, '_id' | 'name' | 'role'> {}

export interface GroupWithStudents extends Group<GroupStudent> {}
