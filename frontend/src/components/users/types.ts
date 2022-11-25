export enum UserRoles {
  Admin = 'AdminUser',
  Teacher = 'TeacherUser',
  Student = 'StudentUser',
  Parent = 'ParentUser',
}

interface BaseUser {
  _id: string
  name: string
  role: UserRoles
  email: string
  lastLogin?: string
  passwordInitiated: boolean
}

export interface Student extends BaseUser {
  role: UserRoles.Student
}

export interface Parent extends BaseUser {
  role: UserRoles.Parent
  students?: string[]
}

export interface Teacher extends BaseUser {
  role: UserRoles.Teacher
  students?: string[]
  groups?: string[]
}

export interface Admin extends BaseUser {
  role: UserRoles.Admin
}

export type User = Student | Admin | Teacher | Parent

export interface PopulatedUser extends Pick<User, '_id' | 'name' | 'role'> {}
