export enum UserRoles {
  Admin = 'AdminUser',
  Teacher = 'TeacherUser',
  Student = 'StudentUser',
  Parent = 'ParentUser',
}

export interface User {
  name: string
  role: UserRoles
  email: string
  lastLogin?: Date
}

export interface Student extends User {
  role: UserRoles.Student
}

export interface Parent extends User {
  role: UserRoles.Parent
  students?: string[]
}

export interface Teacher extends User {
  role: UserRoles.Teacher
  students?: string[]
  groups?: string[]
}

export interface Admin extends User {
  role: UserRoles.Admin
}
