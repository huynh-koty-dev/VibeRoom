import {
  Controller, Post, Get, Query, UseGuards,
  UseInterceptors, UploadedFiles, BadRequestException,
} from '@nestjs/common'
import { FilesInterceptor } from '@nestjs/platform-express'
import { ApiTags, ApiBearerAuth, ApiConsumes } from '@nestjs/swagger'
import { memoryStorage } from 'multer'
import { StorageService } from './storage.service'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'
import { CurrentUser } from '../common/decorators/current-user.decorator'

const ALLOWED_MIME = ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/jpg']
const MAX_SIZE = 10 * 1024 * 1024 // 10MB

@ApiTags('Storage')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('storage')
export class StorageController {
  constructor(private storageService: StorageService) {}

  @Post('upload/photos')
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FilesInterceptor('files', 4, {
    storage: memoryStorage(),
    limits: { fileSize: MAX_SIZE },
    fileFilter: (_req, file, cb) => {
      if (ALLOWED_MIME.includes(file.mimetype)) cb(null, true)
      else cb(new BadRequestException(`Định dạng không hỗ trợ: ${file.mimetype}`), false)
    },
  }))
  async uploadPhotos(
    @UploadedFiles() files: Express.Multer.File[],
    @CurrentUser() user: any,
  ) {
    if (!files?.length) throw new BadRequestException('Vui lòng chọn ít nhất 1 ảnh')

    const userId = (user._id || user.id).toString()
    const keys = await Promise.all(
      files.map((file) => {
        const key = this.storageService.generateKey('uploads', userId, file.originalname)
        return this.storageService.uploadBuffer(key, file.buffer, file.mimetype)
      }),
    )

    return { keys }
  }

  @Get('presign/download')
  async getDownloadUrl(@Query('key') key: string) {
    if (!key) throw new BadRequestException('key is required')
    const url = await this.storageService.getDownloadUrl(key)
    return { url }
  }
}
