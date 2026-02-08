import { getServerSession } from 'next-auth';
import { authOptions } from './auth';
import { loadUser } from './db-users';

export async function getCurrentUser() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    return null;
  }
  
  // Type assertion for user.id (added in JWT callback)
  const userId = (session.user as any).id;
  if (!userId) {
    return null;
  }
  
  return loadUser(userId);
}

export async function requireAuth() {
  const user = await getCurrentUser();
  
  if (!user) {
    throw new Error('Unauthorized');
  }
  
  return user;
}
