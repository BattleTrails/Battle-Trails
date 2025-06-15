export interface User {
  id: string;
  name: string;
  email: string;
  username: string;
  profilePicture?: string;
  bio?: string;
  role?: 'user' | 'admin';
  savedPosts?: string[];
}
