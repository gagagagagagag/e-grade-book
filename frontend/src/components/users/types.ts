export enum UserRoles {
  Admin = 'AdminUser',
  Teacher = 'TeacherUser',
  Student = 'StudentUser',
  Parent = 'ParentUser',
}

interface BaseUser {
  name: string
  role: UserRoles
  email: string
  lastLogin?: Date
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
