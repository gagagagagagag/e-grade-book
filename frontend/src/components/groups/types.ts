import { Student } from '../users/types'

export interface Group<T = string> {
  _id: string
  name: string
  students: T[]
}

export interface GroupWithStudents
  extends Group<Pick<Student, '_id' | 'name'>> {}
