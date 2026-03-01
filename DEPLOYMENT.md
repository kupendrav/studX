# Deployment Checklist

## Pre-Deployment

- [ ] All tests passing
- [ ] Build completes without errors (`npm run build`)
- [ ] Environment variables documented in `.env.example`
- [ ] Database schema created in Supabase
- [ ] Row Level Security policies configured
- [ ] Storage bucket created for student photos
- [ ] Storage bucket set to public access

## Supabase Setup

### 1. Create Students Table

```sql
CREATE TABLE students (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  regno TEXT NOT NULL UNIQUE,
  college TEXT NOT NULL,
  address TEXT NOT NULL,
  destination_from TEXT NOT NULL,
  destination_to TEXT NOT NULL,
  via_1 TEXT,
  via_2 TEXT,
  photo_url TEXT,
  qr_code TEXT NOT NULL,
  application_status TEXT DEFAULT 'approved',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 2. Enable Row Level Security

```sql
ALTER TABLE students ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own applications"
  ON students FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own applications"
  ON students FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own applications"
  ON students FOR UPDATE
  USING (auth.uid() = user_id);
```

### 3. Create Storage Bucket

1. Navigate to Storage in Supabase Dashboard
2. Click "New Bucket"
3. Name: `student-photos`
4. Set to Public
5. Create the bucket

### 4. Configure Storage Policies

```sql
CREATE POLICY "Users can upload their own photos"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'student-photos' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Anyone can view photos"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'student-photos');
```

**Note:** Keep your Supabase credentials secure and never commit them to version control!

## GitHub Pages Deployment (Static)

### 1. Repository Settings

1. Push this project to GitHub
2. Open **Settings → Pages**
3. Set **Source** to **GitHub Actions**

### 2. Repository Secrets

Add these secrets in **Settings → Secrets and variables → Actions**:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Deploy

1. Push to `main` or manually trigger workflow `Deploy to GitHub Pages`
2. Wait for the workflow to finish
3. Visit: `https://<github-username>.github.io/<repository-name>/`

### 4. Limitation

GitHub Pages is static hosting only. API route handlers are not supported, so admin API tools are unavailable on GitHub Pages.
