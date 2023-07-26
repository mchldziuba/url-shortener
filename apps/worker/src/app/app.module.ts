import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { DatabaseModule } from '@purly/database';
import { NotificationModule } from './notification/notification.module';
import { CronModule } from './cron/cron.module';
import { InMemoryModule } from '@purly/in-memory';
import { QueueModule } from '@purly/queue';

@Module({
  imports: [
    QueueModule,
    DatabaseModule,
    InMemoryModule,
    ScheduleModule.forRoot(),
    CronModule,
    NotificationModule,
  ],
})
export class AppModule {}
