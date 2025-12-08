# Supabase Database Setup Guide

This guide will walk you through setting up the Supabase database for the Diabetes Tracker application.

## Prerequisites

- A Supabase account (sign up at [supabase.com](https://supabase.com))
- Access to your Supabase project dashboard

## Step 1: Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign in
2. Click **"New Project"**
3. Fill in the project details:
   - **Name**: `diabetes-tracker` (or your preferred name)
   - **Database Password**: Choose a strong password (save this securely)
   - **Region**: Select the region closest to your users
4. Click **"Create new project"**
5. Wait for the project to be provisioned (this may take a few minutes)

## Step 2: Get Your API Credentials

1. In your Supabase project dashboard, go to **Settings** → **API**
2. Copy the following values:
   - **Project URL** (e.g., `https://your-project-id.supabase.co`)
   - **anon/public key** (under "Project API keys")
3. Add these to your `.env.local` file:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

## Step 3: Create the Database Tables

Go to **SQL Editor** in your Supabase dashboard and run the following SQL commands:

### 3.1 Create the `glucose_records` Table

```sql
-- Create the glucose_records table
CREATE TABLE IF NOT EXISTS glucose_records (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    time_of_day VARCHAR(20) NOT NULL CHECK (time_of_day IN ('Breakfast', 'Lunch', 'Dinner')),
    glucose_level INTEGER NOT NULL CHECK (glucose_level > 0 AND glucose_level < 1000),
    food_description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create an index on user_id for faster queries
CREATE INDEX IF NOT EXISTS idx_glucose_records_user_id ON glucose_records(user_id);

-- Create an index on date for faster date-based queries
CREATE INDEX IF NOT EXISTS idx_glucose_records_date ON glucose_records(date DESC);

-- Create a composite index for common query patterns
CREATE INDEX IF NOT EXISTS idx_glucose_records_user_date ON glucose_records(user_id, date DESC);

-- Create a unique constraint to prevent duplicate entries for same user, date, and meal
CREATE UNIQUE INDEX IF NOT EXISTS idx_glucose_records_unique_entry 
ON glucose_records(user_id, date, time_of_day);
```

### 3.2 Create the `updated_at` Trigger

```sql
-- Create a function to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create a trigger to call the function before any update
DROP TRIGGER IF EXISTS update_glucose_records_updated_at ON glucose_records;
CREATE TRIGGER update_glucose_records_updated_at
    BEFORE UPDATE ON glucose_records
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
```

## Step 4: Set Up Row Level Security (RLS)

Row Level Security ensures users can only access their own data.

```sql
-- Enable Row Level Security on the glucose_records table
ALTER TABLE glucose_records ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view only their own records
CREATE POLICY "Users can view own records" ON glucose_records
    FOR SELECT
    USING (auth.uid() = user_id);

-- Policy: Users can insert only their own records
CREATE POLICY "Users can insert own records" ON glucose_records
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update only their own records
CREATE POLICY "Users can update own records" ON glucose_records
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Policy: Users can delete only their own records
CREATE POLICY "Users can delete own records" ON glucose_records
    FOR DELETE
    USING (auth.uid() = user_id);
```

## Step 5: Configure Authentication

1. Go to **Authentication** → **Providers** in your Supabase dashboard
2. Enable **Email** provider (enabled by default)
3. Configure the following settings under **Authentication** → **Settings**:

### Email Settings
- **Enable email confirmations**: Toggle based on your preference
- **Secure email change**: Enabled (recommended)

### URL Configuration (for production)
Under **Authentication** → **URL Configuration**:
- **Site URL**: Your production URL (e.g., `https://your-app.vercel.app`)
- **Redirect URLs**: Add your allowed redirect URLs:
  - `http://localhost:3000/**` (for development)
  - `https://your-app.vercel.app/**` (for production)

## Step 6: Verify the Setup

Run the following SQL in the SQL Editor to verify everything is set up correctly:

```sql
-- Check if the table exists and view its structure
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'glucose_records'
ORDER BY ordinal_position;

-- Check if RLS is enabled
SELECT 
    schemaname, 
    tablename, 
    rowsecurity 
FROM pg_tables 
WHERE tablename = 'glucose_records';

-- Check the policies
SELECT 
    policyname, 
    cmd, 
    qual, 
    with_check
FROM pg_policies 
WHERE tablename = 'glucose_records';

-- Check the indexes
SELECT 
    indexname, 
    indexdef 
FROM pg_indexes 
WHERE tablename = 'glucose_records';
```

### Expected Output

**Table Structure:**
| column_name      | data_type                | is_nullable | column_default         |
|------------------|--------------------------|-------------|------------------------|
| id               | uuid                     | NO          | gen_random_uuid()      |
| user_id          | uuid                     | NO          |                        |
| date             | date                     | NO          |                        |
| time_of_day      | character varying        | NO          |                        |
| glucose_level    | integer                  | NO          |                        |
| food_description | text                     | YES         |                        |
| created_at       | timestamp with time zone | YES         | now()                  |
| updated_at       | timestamp with time zone | YES         | now()                  |

**RLS Status:**
| schemaname | tablename        | rowsecurity |
|------------|------------------|-------------|
| public     | glucose_records  | true        |

**Policies (4 policies expected):**
- Users can view own records
- Users can insert own records
- Users can update own records
- Users can delete own records

## Step 7: Test the Application

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Open your browser to `http://localhost:3000`

3. Create a new account using the authentication form

4. Try adding a glucose record:
   - Go to the Dashboard or Add Record page
   - Enter a date, time of day, glucose level, and food description
   - Submit the form

5. Verify the record appears in your Records History

## Troubleshooting

### Common Issues

#### "relation 'glucose_records' does not exist"
- Make sure you ran the table creation SQL in Step 3.1
- Verify you're connected to the correct Supabase project

#### "new row violates row-level security policy"
- This usually means the user isn't authenticated
- Make sure the user is logged in before trying to add records
- Verify RLS policies are correctly set up (Step 4)

#### "duplicate key value violates unique constraint"
- You're trying to add a record for the same user, date, and meal time that already exists
- The application should handle this by updating the existing record instead

#### Records not appearing after adding
- Check the browser console for errors
- Verify RLS policies allow SELECT for the user
- Make sure the user_id matches the authenticated user

### Resetting the Database

If you need to start fresh, run:

```sql
-- WARNING: This will delete ALL data in the glucose_records table
DROP TABLE IF EXISTS glucose_records CASCADE;
```

Then re-run all the SQL commands from Steps 3 and 4.

## Environment Variables for Deployment

When deploying to Vercel or another platform, add these environment variables:

| Variable Name                  | Description                    |
|--------------------------------|--------------------------------|
| `NEXT_PUBLIC_SUPABASE_URL`     | Your Supabase project URL      |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY`| Your Supabase anon/public key  |

## Security Best Practices

1. **Never expose your service_role key** - Only use the anon key in client-side code
2. **Keep RLS enabled** - Row Level Security is essential for data isolation
3. **Use strong passwords** - For both your Supabase account and database
4. **Regular backups** - Supabase provides automatic backups, but consider additional backup strategies for production
5. **Monitor usage** - Check the Supabase dashboard regularly for unusual activity

## Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript/introduction)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [Supabase Auth Helpers for Next.js](https://supabase.com/docs/guides/auth/auth-helpers/nextjs)

