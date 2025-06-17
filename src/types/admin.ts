export interface Game {
  id: string;
  title: string;
  description: string | null;
  featured_image_url: string | null;
  trailer_video_url: string | null;
  status: string;
  featured: boolean;
  game_date?: string | null;
  game_time?: string | null;
  tags?: string[] | null;
  created_at: string;
}

export interface Page {
  id: string;
  slug: string;
  title: string;
  content: string;
}

export interface StreamingSettings {
  id: string;
  name: string;
  stream_key: string;
  stream_url: string;
  rtmp_url: string;
  hls_url: string;
  quality_preset: string;
  max_bitrate: number;
  resolution: string;
  framerate: number;
  is_active: boolean;
  auto_record: boolean;
  thumbnail_url: string;
  description: string;
  created_at: string;
  updated_at: string;
}

export interface User {
  id: string;
  user_id: string;
  email: string;
  full_name: string | null;
  role: string;
  phone_number: string | null;
  created_at: string;
}