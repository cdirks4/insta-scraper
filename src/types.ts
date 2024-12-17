export interface InstagramPost {
  imageUrl: string;
  caption: string;
  likeCount: string;
  commentCount: string;
  timestamp: string;
}

export interface InstagramProfile {
  username: string;
  bio: string;
  posts: InstagramPost[];
  interests: string[];
  followerCount: string;
  followingCount: string;
  postCount: string;
  fullName: string;
  isVerified: boolean;
}

export interface ScraperOptions {
  maxPosts?: number;
  maxScrolls?: number;
  headless?: boolean;
  minDelay?: number;
  maxDelay?: number;
  scrollDelay?: number;
  proxy?: string;
}
