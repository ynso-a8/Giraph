-- Create mood_logs table
CREATE TABLE IF NOT EXISTS mood_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID, -- Optional foreign key, can be null or link to auth.users
  mood_score INTEGER NOT NULL CHECK (mood_score >= 0 AND mood_score <= 100),
  feeling TEXT NOT NULL,
  reason TEXT NOT NULL,
  change_reason TEXT DEFAULT '',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable Row Level Security (RLS)
ALTER TABLE mood_logs ENABLE ROW LEVEL SECURITY;

-- Create policies (Allow public read/write if demo, or lock it down per user)
CREATE POLICY "Allow public read access" ON mood_logs
  FOR SELECT USING (true);

CREATE POLICY "Allow public insert access" ON mood_logs
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public update access" ON mood_logs
  FOR UPDATE USING (true);

CREATE POLICY "Allow public delete access" ON mood_logs
  FOR DELETE USING (true);
