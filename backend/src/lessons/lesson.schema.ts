import { Prop, raw, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document, Types } from 'mongoose'

import { Group } from '../groups/group.schema'
import { StudentUser, TeacherUser } from '../users/schemas'

export type LessonDocument = Lesson & Document

export class LessonParticipant {
  student: StudentUser
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

@Schema()
export class Lesson {
  @Prop({ type: Types.ObjectId, ref: 'TeacherUser', required: true })
  teacher: TeacherUser

  @Prop({ type: Types.ObjectId, ref: 'StudentUser' })
  student?: StudentUser

  @Prop({ type: Types.ObjectId, ref: 'Group' })
  group?: Group

  @Prop({ required: true })
  date: Date

  @Prop({ required: true, min: 0 })
  duration: number

  @Prop([
    raw({
      student: { type: Types.ObjectId, ref: 'StudentUser', required: true },
      presence: { type: String, enum: LessonPresence, required: true },
      homework: { type: String, enum: LessonHomework, required: true },
      note: { type: String },
    }),
  ])
  participants: LessonParticipant[]
}

export const LessonSchema = SchemaFactory.createForClass(Lesson)
