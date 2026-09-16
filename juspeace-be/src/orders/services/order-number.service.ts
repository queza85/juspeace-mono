import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class OrderNumberService {
  constructor(private readonly prisma: PrismaService) {}

  async generate(): Promise<string> {
    for (let attempt = 0; attempt < 5; attempt += 1) {
      const latest = await this.prisma.order.findFirst({
        orderBy: { createdAt: 'desc' },
        select: { orderNumber: true },
      });

      const nextSequence = this.parseSequence(latest?.orderNumber) + 1;
      const candidate = `ORD-${String(nextSequence).padStart(5, '0')}`;

      const exists = await this.prisma.order.count({
        where: { orderNumber: candidate },
      });

      if (exists === 0) {
        return candidate;
      }
    }

    const fallback = `ORD-${Date.now()}`;
    return fallback;
  }

  private parseSequence(orderNumber?: string | null): number {
    if (!orderNumber) {
      return 0;
    }

    const match = orderNumber.match(/(\d+)$/);
    return match ? Number.parseInt(match[1], 10) : 0;
  }
}
