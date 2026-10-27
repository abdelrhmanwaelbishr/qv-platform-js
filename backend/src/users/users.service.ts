import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface UpdateProfileInput {
  name?: string;
  fullName?: string | null;
}

@Injectable()
export class UsersService {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  async findById(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async updateProfile(id: string, input: UpdateProfileInput) {
    await this.findById(id);
    return this.prisma.user.update({
      where: { id },
      data: {
        name: input.name,
        fullName: input.fullName,
      },
    });
  }
}
