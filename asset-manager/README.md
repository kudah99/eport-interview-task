# Asset Manager

Asset management system built with Next.js, Supabase, and Ant Design theming.

## Tech Stack

- **Next.js** - React framework
- **Supabase** - Backend and database
- **Ant Design** - UI components with theming

## Setup

### 1. Environment Variables

Create a `.env.local` file in the project root:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_publishable_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
POSTGRES_HOST=your_postgres_host
POSTGRES_USER=postgres
POSTGRES_DATABASE=postgres
POSTGRES_PASSWORD=your_postgres_password


SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
SMTP_FROM=your-email@gmail.com
NEXT_PUBLIC_APP_URL=http://localhost:3000
WARRANTY_API_KEY=your_warranty_api_key
WARRANTY_API_URL=https://server15.eport.ws/api/v1/warranty
```


### 2. Database Setup

Run the database setup script to create initial tables:

```bash
npm run setup-database
```

This creates all required tables and policies.

#### Update Database for Profile Update Requests

To add the profile update request feature, run:

```bash
npm run update-database
```

This creates the `profile_update_requests` table and required policies for the profile update request functionality.

#### Update Database for Warranty Fields

To add warranty fields to the assets table, run:

```bash
npm run update-database-warranty
```

This adds warranty-related columns (`warranty_period_months`, `warranty_expiry_date`, `warranty_notes`, etc.) to the assets table and enables warranty data persistence.

### 3. Create Admin Account

Create an admin user via command line:

```bash
npm run create-admin <email> <password>
```

Example:
```bash
npm run create-admin admin@example.com StrongPass123
```

**Default Admin Credentials:**
- Email: `admin@assetmanager.co.zw`
- Password: `admin.123`

### 4. Run Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)