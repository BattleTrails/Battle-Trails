export interface User {
  id: string;
  name: string;
  email: string;
  profilePicture?: string;
  bio?: string;
  role: 'user' | 'admin';
  savedPosts: string[];
}
