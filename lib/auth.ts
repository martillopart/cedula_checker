import type { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import { loadUserByEmail, saveUser, updateUser } from './db-users';
import { validateEmail, sanitizeString, sanitizeStringWithLimit } from './validation';
import bcrypt from 'bcryptjs';

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const user = loadUserByEmail(credentials.email);
        
        if (!user || !user.password) {
          return null;
        }

        const isValid = await bcrypt.compare(credentials.password, user.password);
        
        if (!isValid) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
        };
      },
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    }),
  ],
  pages: {
    signIn: '/auth/signin',
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      // Handle Google OAuth sign in
      if (account?.provider === 'google' && user.email) {
        try {
          // Validate email format
          const emailValidation = validateEmail(user.email);
          if (!emailValidation.valid) {
            console.error('Invalid email from Google OAuth:', user.email);
            return false;
          }

          // Sanitize email
          const sanitizedEmail = sanitizeString(user.email);
          if (!sanitizedEmail) {
            console.error('Email is empty after sanitization');
            return false;
          }

          // Check if user already exists
          let dbUser = loadUserByEmail(sanitizedEmail);
          
          if (!dbUser) {
            // Sanitize name - use email prefix as fallback if name is missing
            let sanitizedName: string;
            if (user.name) {
              sanitizedName = sanitizeStringWithLimit(user.name, 100);
            } else {
              // Use email prefix as fallback
              const emailPrefix = sanitizedEmail.split('@')[0];
              if (!emailPrefix) {
                console.error('Cannot generate user name from email');
                return false;
              }
              sanitizedName = sanitizeStringWithLimit(emailPrefix, 100);
            }
            
            // Ensure we have a valid name
            if (!sanitizedName || sanitizedName.length === 0) {
              // Final fallback to email prefix (sanitized)
              const emailPrefix = sanitizedEmail.split('@')[0];
              if (!emailPrefix) {
                console.error('Cannot generate user name from email');
                return false;
              }
              // Sanitize the email prefix as final fallback
              // Note: sanitizedEmail is already sanitized, so prefix should be safe
              // But we sanitize again for defense-in-depth
              const finalSanitizedName = sanitizeString(emailPrefix);
              if (!finalSanitizedName || finalSanitizedName.length === 0) {
                // If sanitization results in empty, use the prefix directly
                // This is safe because sanitizedEmail is already sanitized
                sanitizedName = emailPrefix;
              } else {
                sanitizedName = finalSanitizedName;
              }
              // Final validation - ensure we have a non-empty name
              if (!sanitizedName || sanitizedName.length === 0) {
                console.error('Cannot generate valid user name from email');
                return false;
              }
            }

            // Sanitize image URL if provided
            const sanitizedImage = user.image ? sanitizeStringWithLimit(user.image, 500) : undefined;

            // Create new user from Google account
            dbUser = saveUser({
              email: sanitizedEmail,
              name: sanitizedName,
              image: sanitizedImage,
              role: 'member',
              // No password for OAuth users
            });
          } else if (!dbUser.image && user.image) {
            // Sanitize and update user image if not set
            const sanitizedImage = sanitizeStringWithLimit(user.image, 500);
            if (sanitizedImage) {
              updateUser(dbUser.id, { image: sanitizedImage });
            }
          }
          
          // Update user object with database ID
          user.id = dbUser.id;
        } catch (error) {
          console.error('Error handling Google OAuth sign in:', error);
          return false;
        }
      }
      
      return true;
    },
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id;
      }
      if (account?.provider === 'google') {
        // Store provider info if needed
        token.provider = 'google';
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.id) {
        (session.user as any).id = token.id as string;
      }
      return session;
    },
  },
  session: {
    strategy: 'jwt',
  },
  secret: process.env.NEXTAUTH_SECRET || 'your-secret-key-change-in-production',
};
