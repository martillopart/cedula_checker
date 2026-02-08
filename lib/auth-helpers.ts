import { getServerSession } from 'next-auth';
import { authOptions } from './auth';
import { loadUser } from './db-users';

export async function getCurrentUser() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    return null;
  }
  
  return loadUser(session.user.id);
}

export async function requireAuth() {
  const user = await getCurrentUser();
  
  if (!user) {
    throw new Error('Unauthorized');
  }
  
  return user;
}
