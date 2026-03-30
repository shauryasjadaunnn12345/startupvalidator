export type AppRole = 'admin' | 'moderator' | 'user';
export type StartupStatus = 'pending' | 'queued' | 'live' | 'rejected';
export type ValidationStatus = 'pending' | 'approved' | 'rejected' | 'flagged';

export interface Category {
  id: string;
  name: string;
  slug: string;
  created_at: string;
}

export interface Profile {
  id: string;
  user_id: string;
  full_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  created_at: string;
  updated_at: string;
}

export interface UserRole {
  id: string;
  user_id: string;
  role: AppRole;
  created_at: string;
}

export interface Startup {
  id: string;
  user_id: string;
  name: string;
  tagline: string;
  description: string;
  website_url: string | null;
  logo_url: string | null;
  video_url: string | null;
  category_id: string;
  status: StartupStatus;
  rejection_reason: string | null;
  launch_date: string | null;
  upvote_count: number;
  created_at: string;
  updated_at: string;
}

export interface StartupWithDetails extends Startup {
  category: Category;
  profile: Profile;
}

export interface StartupWithCategory extends Startup {
  category: Category;
}

export interface Validation {
  id: string;
  startup_id: string;
  user_id: string;
  content: string;
  ai_status: ValidationStatus;
  ai_reason: string | null;
  admin_status: ValidationStatus | null;
  admin_reason: string | null;
  created_at: string;
  updated_at: string;
}

export interface ValidationWithStartup extends Validation {
  startup: Startup;
}

export interface Upvote {
  id: string;
  startup_id: string;
  user_id: string;
  created_at: string;
}

export interface Comment {
  id: string;
  startup_id: string;
  user_id: string;
  parent_id: string | null;
  content: string;
  created_at: string;
  updated_at: string;
}

export interface CommentWithProfile extends Comment {
  profile: Profile;
  replies?: CommentWithProfile[];
}
