-- CGS Entertainments Database Schema

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Banners Table
CREATE TABLE IF NOT EXISTS banners (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  subtitle TEXT NOT NULL,
  description TEXT,
  button_text TEXT DEFAULT 'Register Now',
  button_url TEXT DEFAULT '/events',
  event_date TEXT,
  location TEXT,
  desktop_image TEXT NOT NULL,
  mobile_image TEXT,
  status TEXT CHECK (status IN ('active', 'inactive', 'draft')) DEFAULT 'active',
  priority INT DEFAULT 0,
  overlay_color TEXT DEFAULT 'rgba(0,0,0,0.4)',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Categories Table
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  icon_name TEXT NOT NULL DEFAULT 'Sparkles',
  color TEXT DEFAULT 'from-purple-500 to-indigo-600',
  display_order INT DEFAULT 0,
  image_url TEXT,
  status TEXT CHECK (status IN ('active', 'hidden')) DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Events Table
CREATE TABLE IF NOT EXISTS events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  banner_url TEXT NOT NULL,
  event_date TEXT NOT NULL,
  location TEXT NOT NULL,
  category_name TEXT NOT NULL,
  registration_fee DECIMAL(10, 2) DEFAULT 0.00,
  currency TEXT DEFAULT 'INR',
  status TEXT CHECK (status IN ('published', 'draft', 'closed')) DEFAULT 'published',
  seats_available INT DEFAULT 100,
  age_group TEXT,
  description TEXT,
  rules TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Website Settings Table
CREATE TABLE IF NOT EXISTS website_settings (
  id INT PRIMARY KEY DEFAULT 1,
  site_name TEXT DEFAULT 'CGS Entertainments',
  logo_url TEXT,
  tagline TEXT DEFAULT 'Show Your Talent. Shine On Stage. Be A Star!',
  contact_email TEXT DEFAULT 'info@cgsentertainments.com',
  phone TEXT DEFAULT '+91 98765 43210',
  address TEXT DEFAULT 'Hyderabad, Telangana, India',
  social_links JSONB DEFAULT '{"facebook": "#", "instagram": "#", "youtube": "#", "twitter": "#"}'::jsonb,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Newsletter Subscriptions Table
CREATE TABLE IF NOT EXISTS newsletter_subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Seed Initial Data for Demo
INSERT INTO banners (title, subtitle, description, button_text, button_url, event_date, location, desktop_image, priority, status)
VALUES 
('DANCE COMPETITION 2026', 'CGS ENTERTAINMENTS', 'Show Your Talent. Shine On Stage. Be A Star!', 'Register Now', '/events', '20 - 22 March, 2026', 'Hyderabad, Telangana', 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&w=1920&q=80', 1, 'active'),
('MEGA MODELING SHOW 2026', 'CGS ENTERTAINMENTS', 'Walk the Ramp of Excellence and Glamour', 'Explore Event', '/events', '10 - 12 June, 2026', 'Bangalore, Karnataka', 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=1920&q=80', 2, 'active')
ON CONFLICT DO NOTHING;

INSERT INTO categories (name, slug, description, icon_name, color, display_order, status)
VALUES 
('Dance', 'dance', 'Explore Dance Competitions', 'Zap', 'from-purple-600 to-indigo-600', 1, 'active'),
('Modeling', 'modeling', 'Showcase Your Modeling Skills', 'Shirt', 'from-blue-500 to-cyan-500', 2, 'active'),
('Acting', 'acting', 'Drama, Theatre & Performances', 'Theater', 'from-amber-500 to-orange-500', 3, 'active'),
('Singing', 'singing', 'Solo & Group Singing Events', 'Mic', 'from-pink-500 to-rose-500', 4, 'active'),
('Music', 'music', 'Instrumental & Band Performances', 'Music', 'from-emerald-500 to-teal-500', 5, 'active'),
('Photography', 'photography', 'Capture Moments, Win Rewards', 'Camera', 'from-orange-500 to-red-500', 6, 'active'),
('More', 'more', 'Many More Categories', 'MoreHorizontal', 'from-purple-500 to-pink-500', 7, 'active')
ON CONFLICT (slug) DO NOTHING;

INSERT INTO events (title, slug, banner_url, event_date, location, category_name, registration_fee, status)
VALUES 
('National Dance Championship', 'national-dance-championship', 'https://images.unsplash.com/photo-1547153760-18fc86324498?auto=format&fit=crop&w=800&q=80', '25 May 2026', 'Hyderabad', 'DANCE', 499, 'published'),
('Elite Modeling Show', 'elite-modeling-show', 'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=800&q=80', '10 June 2026', 'Bangalore', 'MODELING', 799, 'published'),
('Acting Excellence Awards', 'acting-excellence-awards', 'https://images.unsplash.com/photo-1469488865564-c2de10f69f96?auto=format&fit=crop&w=800&q=80', '18 June 2026', 'Chennai', 'ACTING', 399, 'published'),
('Voice of India 2026', 'voice-of-india-2026', 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=800&q=80', '30 June 2026', 'Mumbai', 'SINGING', 599, 'published')
ON CONFLICT (slug) DO NOTHING;
