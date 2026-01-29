import 'dotenv/config';
import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import User from '../models/User.js';
import { encrypt } from './encryption.js';

// Debug: Check if env vars are loaded
console.log('Google Client ID loaded:', process.env.GOOGLE_CLIENT_ID ? 'YES' : 'NO');
console.log('Google Client Secret loaded:', process.env.GOOGLE_CLIENT_SECRET ? 'YES' : 'NO');

passport.use(new LocalStrategy(
  { usernameField: 'email' },
  async (email, password, done) => {
    try {
      const encryptedEmail = encrypt(email);
      const user = await User.findOne({ email: encryptedEmail });
      
      if (!user) {
        return done(null, false, { message: 'Invalid email or password' });
      }
      
      const isValid = await user.comparePassword(password);
      if (!isValid) {
        return done(null, false, { message: 'Invalid email or password' });
      }
      
      return done(null, user);
    } catch (error) {
      return done(error);
    }
  }
));

// Google OAuth - only enable if you have credentials
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  passport.use(new GoogleStrategy({
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        let user = await User.findOne({ googleId: profile.id });
        
        if (!user) {
          const encryptedEmail = encrypt(profile.emails[0].value);
          user = await User.create({
            googleId: profile.id,
            email: encryptedEmail,
            name: profile.displayName
          });
        }
        
        return done(null, user);
      } catch (error) {
        return done(error);
      }
    }
  ));
}

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error);
  }
});

export default passport;