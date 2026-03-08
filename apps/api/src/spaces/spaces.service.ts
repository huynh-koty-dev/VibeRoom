import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model, Types } from 'mongoose'
import { Space, SpaceDocument } from './spaces.schema'
import { AiService } from '../ai/ai.service'
import { CreateSpaceDto, ConfirmAnalysisDto, AddPhotosDto, UpdateConceptDto } from './dto/spaces.dto'

@Injectable()
export class SpacesService {
  constructor(
    @InjectModel(Space.name) private spaceModel: Model<SpaceDocument>,
    private aiService: AiService,
  ) {}

  async create(userId: string, dto: CreateSpaceDto): Promise<SpaceDocument> {
    const space = new this.spaceModel({
      userId: new Types.ObjectId(userId),
      name: dto.name,
      status: 'pending',
    })
    return space.save()
  }

  async findAll(userId: string): Promise<SpaceDocument[]> {
    return this.spaceModel
      .find({ userId: new Types.ObjectId(userId) })
      .sort({ createdAt: -1 })
  }

  async findOne(id: string, userId: string): Promise<SpaceDocument> {
    const space = await this.spaceModel.findById(id)
    if (!space) throw new NotFoundException('Không tìm thấy không gian')
    if (space.userId.toString() !== userId) throw new ForbiddenException()
    return space
  }

  async addPhotosAndAnalyze(id: string, userId: string, dto: AddPhotosDto): Promise<SpaceDocument> {
    const space = await this.findOne(id, userId)

    await this.spaceModel.findByIdAndUpdate(id, {
      photoUrls: dto.photoUrls,
      status: 'analyzing',
    })

    // Phân tích async — không block response
    this.analyzeInBackground(id, dto.photoUrls)

    return this.spaceModel.findById(id) as Promise<SpaceDocument>
  }

  private async analyzeInBackground(spaceId: string, photoUrls: string[]) {
    try {
      const result = await this.aiService.analyzeRoom(photoUrls)
      await this.spaceModel.findByIdAndUpdate(spaceId, {
        analysisResult: result,
        dimensions: result.estimatedDimensions,
        status: 'ready',
      })
    } catch {
      await this.spaceModel.findByIdAndUpdate(spaceId, { status: 'error' })
    }
  }

  async confirmDimensions(id: string, userId: string, dto: ConfirmAnalysisDto): Promise<SpaceDocument> {
    await this.findOne(id, userId)
    return this.spaceModel.findByIdAndUpdate(
      id,
      { dimensions: dto.dimensions, status: 'ready' },
      { new: true },
    ) as Promise<SpaceDocument>
  }

  async updateConcept(id: string, userId: string, dto: UpdateConceptDto): Promise<SpaceDocument> {
    await this.findOne(id, userId)
    return this.spaceModel.findByIdAndUpdate(
      id,
      { conceptId: dto.conceptId },
      { new: true },
    ) as Promise<SpaceDocument>
  }

  async delete(id: string, userId: string): Promise<void> {
    await this.findOne(id, userId)
    await this.spaceModel.findByIdAndDelete(id)
  }
}
