import { Injectable, ConflictException, NotFoundException } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import * as bcrypt from 'bcryptjs'
import { User, UserDocument } from './users.schema'

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async create(email: string, password: string, name: string): Promise<UserDocument> {
    const existing = await this.userModel.findOne({ email: email.toLowerCase() })
    if (existing) throw new ConflictException('Email đã được sử dụng')

    const passwordHash = await bcrypt.hash(password, 12)
    const user = new this.userModel({ email, passwordHash, name })
    return user.save()
  }

  async findByEmail(email: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ email: email.toLowerCase() })
  }

  async findById(id: string): Promise<UserDocument> {
    const user = await this.userModel.findById(id)
    if (!user) throw new NotFoundException('Không tìm thấy người dùng')
    return user
  }

  async updateRefreshToken(userId: string, token: string | null): Promise<void> {
    const hash = token ? await bcrypt.hash(token, 10) : null
    await this.userModel.findByIdAndUpdate(userId, { refreshTokenHash: hash })
  }

  async validateRefreshToken(userId: string, token: string): Promise<boolean> {
    const user = await this.userModel.findById(userId)
    if (!user?.refreshTokenHash) return false
    return bcrypt.compare(token, user.refreshTokenHash)
  }
}
