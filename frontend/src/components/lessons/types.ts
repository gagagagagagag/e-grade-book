export interface Lesson {
  _id: string

  teacher: string

  student?: string

  group?: string

  date: string

  duration: number

  participants: LessonParticipant[]
}

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
