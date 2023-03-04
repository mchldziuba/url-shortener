import { INestApplication } from '@nestjs/common';
import { Config } from '../config/config';
import session from 'express-session';
import passport from 'passport';
import connectRedis from 'connect-redis';
import { injectRedisToken } from '@mich4l/nestjs-redis';

export function setupSession(app: INestApplication, config: Config) {
  // Redis configuration for session storage:
  const RedisStore = connectRedis(session);
  const redisClient = app.get(injectRedisToken());

  app.use(
    session({
      name: 'sid',
      saveUninitialized: false,
      resave: false,
      secret: config.sessionSecret,
      cookie: {
        httpOnly: true,
        sameSite: true,
      },
      store: new RedisStore({ client: redisClient }),
    }),
  );
  app.use(passport.initialize());
  app.use(passport.session());
}
