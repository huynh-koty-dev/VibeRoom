import { Injectable, UnauthorizedException } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { ConfigService } from '@nestjs/config'
import * as bcrypt from 'bcryptjs'
import { UsersService } from '../users/users.service'

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async register(email: string, password: string, name: string) {
    const user = await this.usersService.create(email, password, name)
    const userId = (user._id as any).toString()
    const tokens = await this.generateTokens(userId, user.email)
    await this.usersService.updateRefreshToken(userId, tokens.refreshToken)
    return { user, tokens }
  }

  async login(email: string, password: string) {
    const user = await this.usersService.findByEmail(email)
    if (!user) throw new UnauthorizedException('Email hoặc mật khẩu không đúng')

    const isValid = await bcrypt.compare(password, user.passwordHash)
    if (!isValid) throw new UnauthorizedException('Email hoặc mật khẩu không đúng')

    const userId = (user._id as any).toString()
    const tokens = await this.generateTokens(userId, user.email)
    await this.usersService.updateRefreshToken(userId, tokens.refreshToken)
    return { user, tokens }
  }

  async refresh(userId: string, refreshToken: string) {
    const isValid = await this.usersService.validateRefreshToken(userId, refreshToken)
    if (!isValid) throw new UnauthorizedException('Refresh token không hợp lệ')

    const user = await this.usersService.findById(userId)
    const tokens = await this.generateTokens(userId, user.email)
    await this.usersService.updateRefreshToken(userId, tokens.refreshToken)
    return { user, tokens }
  }

  async logout(userId: string) {
    await this.usersService.updateRefreshToken(userId, null)
  }

  private async generateTokens(userId: string, email: string) {
    const payload = { sub: userId, email }

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.configService.get('JWT_SECRET'),
        expiresIn: this.configService.get('JWT_EXPIRES_IN') || '15m',
      }),
      this.jwtService.signAsync(payload, {
        secret: this.configService.get('JWT_REFRESH_SECRET'),
        expiresIn: this.configService.get('JWT_REFRESH_EXPIRES_IN') || '7d',
      }),
    ])

    return { accessToken, refreshToken }
  }
}
