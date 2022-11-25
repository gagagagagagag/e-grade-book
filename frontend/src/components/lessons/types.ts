import { PopulatedUser } from '../users/types'

export interface Lesson<T = string, S = string, G = string> {
  _id: string

  teacher: T

  student?: S

  group?: G

  date: string

  duration: number

  participants: LessonParticipant[]
}

export interface LessonWithUsers
  extends Lesson<PopulatedUser | null, PopulatedUser, PopulatedUser> {}

export interface LessonParticipant {
  student: string
  presence: LessonPresence
  homework: LessonHomework
  note?: string
}

export enum LessonPresence {
  Present = 'present',
  Late = 'late',
  Absent = 'absent',
}

export enum LessonHomework {
  Done = 'done',
  Partial = 'partial',
  NotDone = 'notDone',
}
