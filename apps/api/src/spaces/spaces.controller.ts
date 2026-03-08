import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards, HttpCode, HttpStatus } from '@nestjs/common'
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger'
import { SpacesService } from './spaces.service'
import { CreateSpaceDto, ConfirmAnalysisDto, AddPhotosDto, UpdateConceptDto } from './dto/spaces.dto'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'
import { CurrentUser } from '../common/decorators/current-user.decorator'

@ApiTags('Spaces')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('spaces')
export class SpacesController {
  constructor(private spacesService: SpacesService) {}

  @Post()
  @ApiOperation({ summary: 'Tạo không gian mới' })
  create(@Body() dto: CreateSpaceDto, @CurrentUser() user: any) {
    return this.spacesService.create(user.id, dto)
  }

  @Get()
  @ApiOperation({ summary: 'Danh sách không gian của tôi' })
  findAll(@CurrentUser() user: any) {
    return this.spacesService.findAll(user.id)
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() user: any) {
    return this.spacesService.findOne(id, user.id)
  }

  @Post(':id/photos')
  @ApiOperation({ summary: 'Upload ảnh và trigger AI analysis' })
  addPhotos(@Param('id') id: string, @Body() dto: AddPhotosDto, @CurrentUser() user: any) {
    return this.spacesService.addPhotosAndAnalyze(id, user.id, dto)
  }

  @Patch(':id/dimensions')
  @ApiOperation({ summary: 'Xác nhận hoặc chỉnh sửa kích thước phòng' })
  confirmDimensions(@Param('id') id: string, @Body() dto: ConfirmAnalysisDto, @CurrentUser() user: any) {
    return this.spacesService.confirmDimensions(id, user.id, dto)
  }

  @Patch(':id/concept')
  updateConcept(@Param('id') id: string, @Body() dto: UpdateConceptDto, @CurrentUser() user: any) {
    return this.spacesService.updateConcept(id, user.id, dto)
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  delete(@Param('id') id: string, @CurrentUser() user: any) {
    return this.spacesService.delete(id, user.id)
  }
}
