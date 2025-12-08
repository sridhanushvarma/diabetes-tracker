# Diabetes Tracker Web App

A comprehensive web application for tracking and monitoring diabetes metrics over time. Features a modern, responsive UI with dark/light mode support.

![Diabetes Tracker](https://img.shields.io/badge/Next.js-14.2-black?logo=next.js) ![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?logo=typescript) ![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?logo=tailwind-css) ![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?logo=supabase)

## Features

- **User Data Entry**: Record blood sugar levels, meal times (Breakfast, Lunch, Dinner), and food consumed
- **Long-term Storage**: Store and access up to 5 years of health data securely in the cloud
- **Analytics & Insights**: View weekly, monthly, and yearly averages with interactive visual charts
- **User Authentication**: Secure email-based authentication to keep your health data private
- **Data Import**: Bulk import glucose records from Excel (.xlsx, .xls) or CSV files
- **Data Export**: Download your records as Excel/CSV for sharing with healthcare providers
- **Reports**: Generate detailed reports with glucose trends and statistics
- **Dark/Light Mode**: Fully responsive UI with automatic theme detection and manual toggle
- **Mobile Responsive**: Works seamlessly on desktop, tablet, and mobile devices

## Tech Stack

- **Frontend**: Next.js 14 with React 18 and TypeScript
- **Styling**: Tailwind CSS with custom theme support
- **Database**: Supabase (PostgreSQL) with Row Level Security
- **Authentication**: Supabase Auth (email/password)
- **Charts**: Chart.js with react-chartjs-2
- **Excel Handling**: xlsx library for import/export
- **Deployment**: Vercel

## Live Demo

Visit the live application: [Diabetes Tracker](https://diabetes-tracker-q22t.vercel.app)

## Getting Started

### Prerequisites

- Node.js (v18 or later recommended)
- npm, yarn, or pnpm
- Supabase account (free tier available)

### Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/sridhanushvarma/diabetes-tracker.git
   cd diabetes-tracker
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. Set up Supabase:
   - Sign up at [supabase.com](https://supabase.com)
   - Create a new project
   - Follow the database setup instructions in [SUPABASE_SETUP.md](SUPABASE_SETUP.md)
   - Get your project URL and anon key from Project Settings > API

4. Set up environment variables:
   - Create a `.env.local` file in the project root:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
   ```

5. Run the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Database Setup

For detailed instructions on setting up the Supabase database, including:
- Creating the `glucose_records` table
- Setting up Row Level Security (RLS) policies
- Creating indexes and triggers
- Configuring authentication redirects

Please refer to [SUPABASE_SETUP.md](SUPABASE_SETUP.md).

## Project Structure

```
src/
├── components/         # Reusable React components
│   ├── Auth.tsx       # Authentication form
│   ├── GlucoseChart.tsx   # Chart component
│   ├── ImportForm.tsx     # Data import form
│   ├── Layout.tsx     # Main layout wrapper
│   ├── RecordForm.tsx # Add record form
│   ├── RecordsList.tsx    # Records table
│   ├── StatsSummary.tsx   # Statistics cards
│   └── ThemeLayout.tsx    # Theme provider wrapper
├── contexts/          # React contexts
│   └── ThemeContext.tsx   # Dark/light mode context
├── pages/             # Next.js pages
│   ├── auth.tsx       # Login/signup page
│   ├── dashboard.tsx  # Main dashboard
│   ├── import.tsx     # Data import page
│   ├── index.tsx      # Landing page
│   ├── reports.tsx    # Reports page
│   ├── settings.tsx   # User settings
│   └── records/       # Records management
├── services/          # API services
├── styles/            # Global styles
│   └── globals.css    # Tailwind + custom CSS
└── utils/             # Utility functions
    ├── supabase.ts    # Supabase client
    ├── dateUtils.ts   # Date formatting
    └── statsCalculator.ts # Statistics calculations
```

## Usage

1. **Sign Up/Sign In**: Create an account or sign in with your email
2. **Dashboard**: View your recent glucose readings, trends, and statistics
3. **Add Records**: Log your glucose levels after meals with food descriptions
4. **View History**: Browse and filter your historical records
5. **Import Data**: Bulk import records from Excel or CSV files
6. **Generate Reports**: View detailed analytics and export data
7. **Settings**: Manage your profile and account preferences

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import the project in [Vercel](https://vercel.com)
3. Add environment variables in Project Settings:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Deploy!

### Supabase Configuration for Production

Update your Supabase project settings:
1. Go to Authentication > URL Configuration
2. Set Site URL to your production URL (e.g., `https://your-app.vercel.app`)
3. Add redirect URLs: `https://your-app.vercel.app/**`

## Troubleshooting

### Common Issues

1. **Authentication not working**: Ensure your Supabase URL and anon key are correct in `.env.local`
2. **Database errors**: Make sure you've run all SQL commands from `SUPABASE_SETUP.md`
3. **Build errors**: Run `npm install` to ensure all dependencies are installed
4. **Theme not working**: Clear browser cache or check if `ThemeContext` is properly wrapped

### Getting Help

If you encounter issues:
1. Check the browser console for errors
2. Verify your Supabase configuration
3. Ensure all environment variables are set correctly
4. Open an issue on GitHub with detailed error information

## License

[MIT](LICENSE)

## Attribution Requirement

If you use this project in any form (website, app, service, or derivative code), you **must** include the following attribution in your documentation, website footer, or credits page:

> Created by Sridhanush Varma – [https://github.com/sridhanushvarma/diabetes-tracker](https://github.com/sridhanushvarma/diabetes-tracker)

Thank you for respecting the work that went into this project!

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request
