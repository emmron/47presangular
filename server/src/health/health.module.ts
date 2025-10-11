import { Module } from '@nestjs/common';
import { HealthController } from './health.controller';
import { NewsModule } from '../news/news.module';

@Module({
  imports: [NewsModule],
  controllers: [HealthController]
})
export class HealthModule {}
