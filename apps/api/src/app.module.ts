import { Module } from '@nestjs/common';
import { DatabaseModule } from './database/database.module';
import { ConfigModule } from './config/config.module';
import { AccountModule } from './account/account.module';
import { AuthModule } from './auth/auth.module';
import { RedisModule } from '@mich4l/nestjs-redis';
import { Config } from './config/config';
import { SubscriptionModule } from './subscription/subscription.module';
import { StripeModule } from './stripe/stripe.module';
import { PlanModule } from './plan/plan.module';
import { StripeEventModule } from './stripe-event/stripe-event.module';
import { TokenModule } from './token/token.module';
import { RangeModule } from './range/range.module';
import { LinkModule } from './link/link.module';
import { ReportModule } from './report/report.module';

@Module({
  imports: [
    ConfigModule,
    RedisModule.forRootAsync({ useExisting: Config }),
    DatabaseModule,
    AccountModule,
    TokenModule,
    AuthModule,
    StripeModule,
    StripeEventModule,
    PlanModule,
    SubscriptionModule,
    RangeModule,
    LinkModule,
    ReportModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
