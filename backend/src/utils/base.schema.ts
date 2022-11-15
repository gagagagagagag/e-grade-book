import { Types } from 'mongoose'

export abstract class BaseSchema {
  _id: Types.ObjectId

  id: string
}
