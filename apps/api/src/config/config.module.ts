import { Global, Module } from '@nestjs/common';
import { ConfigModule as BaseConfigModule } from '@nestjs/config';
import { ConfigSchema } from './config.schema';
import { Config } from './config';
import * as process from 'process';

@Global()
@Module({
  imports: [
    BaseConfigModule.forRoot({
      cache: true,
      validationSchema: ConfigSchema,
      envFilePath: getEnvFilename(),
    }),
  ],
  providers: [Config],
  exports: [Config],
})
export class ConfigModule {}

function getEnvFilename() {
  if (process.env.NODE_ENV === 'test') {
    return '.env.test';
  }

  return; // default;
}
