import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document } from 'mongoose'

export type UserDocument = User & Document

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true, unique: true, lowercase: true })
  email: string

  @Prop({ required: true })
  passwordHash: string

  @Prop({ required: true })
  name: string

  @Prop({ default: 'user', enum: ['user', 'designer', 'company_admin', 'admin'] })
  role: string

  @Prop()
  avatarUrl?: string

  @Prop()
  refreshTokenHash?: string
}

export const UserSchema = SchemaFactory.createForClass(User)

UserSchema.set('toJSON', {
  virtuals: true,
  transform: (_doc, ret: Record<string, any>) => {
    delete ret._id
    delete ret.__v
    delete ret.passwordHash
    delete ret.refreshTokenHash
    return ret
  },
})

UserSchema.virtual('id').get(function () {
  return (this._id as any).toString()
})
