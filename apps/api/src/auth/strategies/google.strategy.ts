import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, Profile } from 'passport-google-oauth20';
import { OAuthProfile } from '../auth.interface';
import { Providers } from '@purly/postgres';

@Injectable()
export class GoogleStrategy extends PassportStrategy(
  Strategy,
  Providers.GOOGLE
) {
  constructor() {
    super({
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      session: false,
      callbackURL: '/api/auth/google/callback',
      scope: ['email', 'profile'],
    });
  }

  validate(_, __, profile: GoogleProfile): OAuthProfile {
    const email = this.getEmail(profile.emails as GoogleEmail[]);
    if (!email) {
      throw new UnauthorizedException('Unverified Google account');
    }

    return {
      email,
      provider: Providers.GOOGLE,
      subject: profile.id,
      name: profile.displayName,
      picture: this.getPhoto(profile.photos),
    };
  }

  private getPhoto(photos?: Array<{ value: string }>) {
    if (photos && photos.length) {
      return photos[0].value;
    }

    return;
  }

  private getEmail(emails: GoogleEmail[]) {
    if (!emails) {
      return;
    }

    const verifiedEmail = emails.find((email) => email.verified);
    if (!verifiedEmail) {
      return;
    }

    return verifiedEmail.value;
  }
}

type GoogleProfile = Exclude<Profile, 'emails'> & {
  emails: GoogleEmail[];
};

interface GoogleEmail {
  verified: boolean;
  value: string;
}
