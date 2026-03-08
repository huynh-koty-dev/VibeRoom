import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { Space, SpaceSchema } from './spaces.schema'
import { SpacesService } from './spaces.service'
import { SpacesController } from './spaces.controller'
import { AiModule } from '../ai/ai.module'

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Space.name, schema: SpaceSchema }]),
    AiModule,
  ],
  providers: [SpacesService],
  controllers: [SpacesController],
  exports: [SpacesService],
})
export class SpacesModule {}
