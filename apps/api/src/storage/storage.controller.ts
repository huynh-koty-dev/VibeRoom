import { Controller, Post, Get, Body, Query, UseGuards } from '@nestjs/common'
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger'
import { IsString, IsNotEmpty } from 'class-validator'
import { StorageService } from './storage.service'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'
import { CurrentUser } from '../common/decorators/current-user.decorator'

class PresignUploadDto {
  @IsString() @IsNotEmpty() filename: string
  @IsString() @IsNotEmpty() contentType: string
  @IsString() @IsNotEmpty() folder: string
}

@ApiTags('Storage')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('storage')
export class StorageController {
  constructor(private storageService: StorageService) {}

  @Post('presign/upload')
  async getUploadUrl(@Body() dto: PresignUploadDto, @CurrentUser() user: any) {
    const key = this.storageService.generateKey(dto.folder, user.id, dto.filename)
    const url = await this.storageService.getUploadUrl(key, dto.contentType)
    return { url, key }
  }

  @Get('presign/download')
  async getDownloadUrl(@Query('key') key: string) {
    const url = await this.storageService.getDownloadUrl(key)
    return { url }
  }
}
