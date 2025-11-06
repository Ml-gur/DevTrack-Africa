# DevTrack Africa - Database Setup Guide

## Critical: Your Database Tables Are Missing

The errors you're experiencing are because the required database tables haven't been created in your Supabase instance. Here's how to fix this:

## Step 1: Access Your Supabase Dashboard

1. Go to [https://supabase.com](https://supabase.com)
2. Sign in to your account
3. Navigate to your DevTrack Africa project

## Step 2: Run the Database Setup Script  

1. In your Supabase dashboard, go to the **SQL Editor** (left sidebar)
2. Click **"+ New Query"**
3. Copy the entire contents of `/database-setup-critical-fix.sql` from your project root
4. Paste it into the SQL editor
5. Click **"Run"** to execute the script

## Step 3: Verify Table Creation

After running the script, verify that the tables were created:

1. Go to **Table Editor** in the left sidebar
2. You should see these tables:
   - `users`
   - `projects` 
   - `tasks`
   - `posts`
   - `comments`
   - `likes`
   - `messages`
   - `notifications`
   - `collaborations`

## Step 4: Check Row Level Security

1. In **Table Editor**, click on each table
2. Go to the **RLS** tab
3. Ensure RLS is **enabled** for all tables
4. Verify that policies are created (they should be created automatically by the script)

## Step 5: Test Your Application

1. Refresh your DevTrack Africa application
2. Try to sign up or log in
3. The errors should now be resolved

## Common Issues and Solutions

### Issue: "Invalid login credentials"
**Solution:** Create a test account:
1. Go to **Authentication** → **Users** in Supabase
2. Click **"Add user"**  
3. Add email: `test@devtrack.africa`
4. Add password: `TestPassword123!`
5. Check **"Auto Confirm User"**
6. Click **"Create user"**

### Issue: Tables still not found after running script
**Solution:** 
1. Check that you're in the correct Supabase project
2. Ensure the script ran without errors
3. Try running individual table creation statements from the script

### Issue: RLS policies blocking access
**Solution:**
1. Check that the user is properly authenticated
2. Verify that the RLS policies were created correctly
3. Temporarily disable RLS on a table to test (NOT recommended for production)

## What the Setup Script Does

The `database-setup-critical-fix.sql` script:
- ✅ Creates all required database tables
- ✅ Sets up proper relationships between tables
- ✅ Creates indexes for better performance
- ✅ Enables Row Level Security (RLS)
- ✅ Creates security policies for data access
- ✅ Sets up automatic triggers for timestamps
- ✅ Creates a trigger for automatic user profile creation

## Environment Variables

Make sure your environment variables are correctly set in your `.env` file or deployment environment:

```bash
REACT_APP_SUPABASE_URL=https://your-project-id.supabase.co
REACT_APP_SUPABASE_ANON_KEY=your-anon-key
```

Or for Vite:
```bash
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

## Need Help?

If you continue to experience issues after following this guide:

1. Check the browser console for detailed error messages
2. Check the Supabase dashboard logs
3. Ensure your Supabase project is on a paid tier if needed
4. Try creating a new Supabase project and running the setup script

## Production Deployment

For production deployment on Vercel:

1. Add your Supabase environment variables to Vercel:
   - Go to your Vercel project dashboard
   - Click **Settings** → **Environment Variables**
   - Add both `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`

2. Redeploy your application after setting up the database

---

**Important:** This setup is required for DevTrack Africa to function properly. The application is designed to work entirely online with Supabase as the backend.