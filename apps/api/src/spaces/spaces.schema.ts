import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document, Types } from 'mongoose'

export type SpaceDocument = Space & Document

@Schema({ _id: false })
class Dimensions {
  @Prop({ required: true }) width: number
  @Prop({ required: true }) length: number
  @Prop({ required: true }) height: number
}

@Schema({ _id: false })
class RoomAnalysisResult {
  @Prop() roomType: string
  @Prop({ type: Object }) estimatedDimensions: Dimensions
  @Prop({ type: [String] }) existingFurniture: string[]
  @Prop() lightingDirection: string
  @Prop() currentStyle: string
  @Prop({ type: [String] }) colorPalette: string[]
  @Prop() description: string
  @Prop() confidence: number
}

@Schema({ timestamps: true })
export class Space {
  @Prop({ required: true, type: Types.ObjectId, ref: 'User' })
  userId: Types.ObjectId

  @Prop({ required: true })
  name: string

  @Prop({ type: [String], default: [] })
  photoUrls: string[]

  @Prop({ type: Object })
  dimensions?: Dimensions

  @Prop({ type: Object })
  analysisResult?: RoomAnalysisResult

  @Prop()
  conceptId?: string

  @Prop({
    default: 'pending',
    enum: ['pending', 'analyzing', 'ready', 'error'],
  })
  status: string
}

export const SpaceSchema = SchemaFactory.createForClass(Space)

SpaceSchema.set('toJSON', {
  virtuals: true,
  transform: (_doc, ret: Record<string, any>) => {
    delete ret._id
    delete ret.__v
    return ret
  },
})

SpaceSchema.virtual('id').get(function () {
  return (this._id as any).toString()
})
