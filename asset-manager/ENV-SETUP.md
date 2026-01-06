# Environment Variables Setup

This guide will help you set up your environment variables for the Asset Manager application.

## Quick Setup

1. **Create `.env.local` file** in the project root (same directory as `package.json`)

2. **Add the following variables** to `.env.local`:

```env
# Supabase Configuration (Required)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_supabase_publishable_key

# Supabase Service Role Key (Required for admin operations)
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Direct PostgreSQL Connection (Required for database setup)
POSTGRES_HOST=db.[YOUR-PROJECT-REF].supabase.co
POSTGRES_USER=postgres
POSTGRES_DATABASE=postgres
POSTGRES_PASSWORD=[YOUR-PASSWORD]
```

## Where to Find These Values

### 1. Supabase URL and Publishable Key
- Go to: https://supabase.com/dashboard/project/_/settings/api
- Copy:
  - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
  - **anon/public key** → `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`

### 2. Service Role Key
- Go to: https://supabase.com/dashboard/project/_/settings/api
- Scroll down to **Project API keys**
- Copy the **service_role** key (⚠️ Keep this secret!) → `SUPABASE_SERVICE_ROLE_KEY`

### 3. PostgreSQL Connection Parameters
- Go to: https://supabase.com/dashboard/project/_/settings/database
- Under **Connection string**, you'll find:
  - **Host** → `POSTGRES_HOST` (e.g., `db.abcdefghijklmnop.supabase.co` or `aws-0-us-east-1.pooler.supabase.com`)
  - **Database** → `POSTGRES_DATABASE` (usually `postgres`)
  - **User** → `POSTGRES_USER` (usually `postgres`)
  - **Password** → `POSTGRES_PASSWORD` (your database password)
  - **Port** → `POSTGRES_PORT` (optional, defaults to 5432, use 6543 for Supabase connection pooler)

**Note**: For Supabase, you may need to use port **6543** (connection pooler) instead of 5432. If you get connection timeouts, try adding `POSTGRES_PORT=6543` to your `.env.local`.

## Example `.env.local` File

```env
NEXT_PUBLIC_SUPABASE_URL=https://abcdefghijklmnop.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
POSTGRES_HOST=db.abcdefghijklmnop.supabase.co
POSTGRES_USER=postgres
POSTGRES_DATABASE=postgres
POSTGRES_PASSWORD=your_database_password_here
```

## Verify Setup

After creating `.env.local`, you can verify it's working:

1. **Setup database**:
   ```bash
   npm run setup-database
   ```

2. **Create admin user**:
   ```bash
   npm run create-admin admin@example.com StrongPass123
   ```

## Troubleshooting

### Error: "Missing required environment variables"
- Make sure `.env.local` exists in the project root
- Check that all variables are set (no empty values)
- Verify there are no typos in variable names
- Restart your terminal/command prompt after creating `.env.local`

### Error: "PostgreSQL connection parameters are not set"
- Make sure `POSTGRES_HOST` and `POSTGRES_PASSWORD` are in your `.env.local` file
- `POSTGRES_USER` and `POSTGRES_DATABASE` are optional (default to 'postgres')
- Verify all values are correct from your Supabase dashboard

### Scripts still not finding variables
- Make sure `.env.local` is in the same directory as `package.json`
- Check that the file is named exactly `.env.local` (not `.env.local.txt`)
- Try running the scripts from the project root directory

## Security Notes

⚠️ **Important**: 
- Never commit `.env.local` to version control (it's already in `.gitignore`)
- Never share your `SUPABASE_SERVICE_ROLE_KEY` publicly
- The service role key bypasses Row Level Security - keep it secret!

