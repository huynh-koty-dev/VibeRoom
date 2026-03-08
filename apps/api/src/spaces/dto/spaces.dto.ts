import { IsString, IsNotEmpty, IsNumber, Min, Max, IsArray, IsOptional, ValidateNested, IsObject } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'
import { Type } from 'class-transformer'

export class CreateSpaceDto {
  @ApiProperty({ example: 'Phòng khách' })
  @IsString()
  @IsNotEmpty({ message: 'Tên không gian không được để trống' })
  name: string
}

export class DimensionsDto {
  @ApiProperty({ example: 4.5 })
  @IsNumber()
  @Min(1, { message: 'Chiều rộng tối thiểu 1m' })
  @Max(50)
  width: number

  @ApiProperty({ example: 6 })
  @IsNumber()
  @Min(1, { message: 'Chiều dài tối thiểu 1m' })
  @Max(50)
  length: number

  @ApiProperty({ example: 2.7 })
  @IsNumber()
  @Min(2, { message: 'Chiều cao tối thiểu 2m' })
  @Max(10)
  height: number
}

export class ConfirmAnalysisDto {
  @ApiProperty()
  @IsObject()
  @ValidateNested()
  @Type(() => DimensionsDto)
  dimensions: DimensionsDto
}

export class AddPhotosDto {
  @ApiProperty({ type: [String] })
  @IsArray()
  @IsString({ each: true })
  photoUrls: string[]
}

export class UpdateConceptDto {
  @ApiProperty({ example: 'scandinavian' })
  @IsString()
  @IsOptional()
  conceptId?: string
}
