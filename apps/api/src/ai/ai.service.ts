import { Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import Anthropic from '@anthropic-ai/sdk'

export interface RoomAnalysisResult {
  roomType: string
  estimatedDimensions: { width: number; length: number; height: number }
  existingFurniture: string[]
  lightingDirection: string
  currentStyle: string
  colorPalette: string[]
  description: string
  confidence: number
}

@Injectable()
export class AiService {
  private client: Anthropic
  private readonly logger = new Logger(AiService.name)

  constructor(private configService: ConfigService) {
    this.client = new Anthropic({
      apiKey: this.configService.get<string>('ANTHROPIC_API_KEY'),
    })
  }

  async analyzeRoom(photoUrls: string[]): Promise<RoomAnalysisResult> {
    const imageContents = photoUrls.map((url) => ({
      type: 'image' as const,
      source: { type: 'url' as const, url },
    }))

    const prompt = `Bạn là chuyên gia phân tích không gian nội thất. Hãy phân tích ảnh phòng và trả về JSON.

Yêu cầu output (JSON duy nhất, không có text nào khác ngoài JSON):
{
  "roomType": "living_room|bedroom|kitchen|dining_room|bathroom|office|other",
  "estimatedDimensions": {
    "width": <số thực, đơn vị mét, ước tính dựa trên tỷ lệ>,
    "length": <số thực, đơn vị mét>,
    "height": <số thực, đơn vị mét>
  },
  "existingFurniture": ["<tên đồ vật bằng tiếng Việt>"],
  "lightingDirection": "north|south|east|west|unknown",
  "currentStyle": "<mô tả ngắn phong cách hiện tại bằng tiếng Việt>",
  "colorPalette": ["<màu chủ đạo bằng tiếng Việt>"],
  "description": "<1-2 câu mô tả không gian bằng tiếng Việt, thân thiện>",
  "confidence": <0.0 đến 1.0>
}

Lưu ý quan trọng:
- Kích thước là ước tính, user sẽ xác nhận lại
- Phòng nhỏ điển hình VN: 3x4m, phòng khách: 4x5m đến 5x7m, trần 2.5-3m
- Nếu ảnh mờ hoặc không đủ rõ, confidence thấp hơn 0.5`

    try {
      const response = await this.client.messages.create({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 1024,
        messages: [
          {
            role: 'user',
            content: [
              ...imageContents,
              { type: 'text', text: prompt },
            ],
          },
        ],
      })

      const text = response.content[0].type === 'text' ? response.content[0].text : ''
      const jsonMatch = text.match(/\{[\s\S]*\}/)
      if (!jsonMatch) throw new Error('Không parse được JSON từ Claude')

      const result = JSON.parse(jsonMatch[0]) as RoomAnalysisResult
      return this.validateAnalysisResult(result)
    } catch (error) {
      this.logger.error('Room analysis failed', error)
      return this.defaultAnalysisResult()
    }
  }

  private validateAnalysisResult(result: any): RoomAnalysisResult {
    const validRoomTypes = ['living_room', 'bedroom', 'kitchen', 'dining_room', 'bathroom', 'office', 'other']
    const validDirections = ['north', 'south', 'east', 'west', 'unknown']

    return {
      roomType: validRoomTypes.includes(result.roomType) ? result.roomType : 'other',
      estimatedDimensions: {
        width: Math.min(Math.max(Number(result.estimatedDimensions?.width) || 4, 2), 20),
        length: Math.min(Math.max(Number(result.estimatedDimensions?.length) || 5, 2), 20),
        height: Math.min(Math.max(Number(result.estimatedDimensions?.height) || 2.7, 2), 5),
      },
      existingFurniture: Array.isArray(result.existingFurniture) ? result.existingFurniture.slice(0, 10) : [],
      lightingDirection: validDirections.includes(result.lightingDirection) ? result.lightingDirection : 'unknown',
      currentStyle: result.currentStyle || 'Chưa xác định',
      colorPalette: Array.isArray(result.colorPalette) ? result.colorPalette.slice(0, 5) : [],
      description: result.description || 'Không gian cần được phân tích thêm.',
      confidence: Math.min(Math.max(Number(result.confidence) || 0.5, 0), 1),
    }
  }

  private defaultAnalysisResult(): RoomAnalysisResult {
    return {
      roomType: 'other',
      estimatedDimensions: { width: 4, length: 5, height: 2.7 },
      existingFurniture: [],
      lightingDirection: 'unknown',
      currentStyle: 'Chưa xác định',
      colorPalette: [],
      description: 'Không thể phân tích ảnh. Vui lòng nhập kích thước thủ công.',
      confidence: 0,
    }
  }
}
