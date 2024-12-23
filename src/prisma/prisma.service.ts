import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor() {
    super();
  }

  // Called when the module initializes
  async onModuleInit() {
    await this.$connect();
    console.log('Connected to the database');
  }

  // Called when the module is destroyed (application shuts down)
  async onModuleDestroy() {
    await this.$disconnect();
    console.log('Disconnected from the database');
  }
 
}
