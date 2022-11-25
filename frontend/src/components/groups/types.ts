import { PopulatedUser } from '../users/types'

export interface Group<T = string> {
  _id: string
  name: string
  students?: T[]
}

export interface PopulatedGroup extends Pick<Group, '_id' | 'name'> {}

export interface GroupWithStudents extends Group<PopulatedUser> {}
