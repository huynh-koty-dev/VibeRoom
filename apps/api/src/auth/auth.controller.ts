import { Controller, Post, Body, UseGuards, Req, HttpCode, HttpStatus } from '@nestjs/common'
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger'
import { AuthService } from './auth.service'
import { RegisterDto, LoginDto, RefreshDto } from './auth.dto'
import { JwtAuthGuard } from './jwt-auth.guard'
import { CurrentUser } from '../common/decorators/current-user.decorator'

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  async register(@Body() dto: RegisterDto) {
    const { user, tokens } = await this.authService.register(dto.email, dto.password, dto.name)
    return { user, tokens }
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() dto: LoginDto) {
    const { user, tokens } = await this.authService.login(dto.email, dto.password)
    return { user, tokens }
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(@Body() dto: RefreshDto, @Req() req: any) {
    // Decode without verify to get userId, then validate refresh token
    const payload = this.decodeToken(dto.refreshToken)
    if (!payload?.sub) throw new Error('Token không hợp lệ')
    const { user, tokens } = await this.authService.refresh(payload.sub, dto.refreshToken)
    return { user, tokens }
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  async logout(@CurrentUser() user: any) {
    await this.authService.logout(user.id)
    return { message: 'Đăng xuất thành công' }
  }

  private decodeToken(token: string): any {
    try {
      const parts = token.split('.')
      if (parts.length !== 3) return null
      return JSON.parse(Buffer.from(parts[1], 'base64').toString())
    } catch {
      return null
    }
  }
}
