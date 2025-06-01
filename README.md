# 🍕 Pizza Palace

## Developer: Arpit Sarang

## Overview

Pizza Palace is a modern online pizza ordering platform built with Next.js and Supabase. The application allows users to browse a variety of pizza options, customize their orders, add items to cart, and complete the checkout process. It features user authentication, order tracking, and a loyalty points system to reward returning customers.

## Features

- 🔐 User authentication with Supabase Auth
- 🍕 Interactive menu with category filtering
- 🛒 Shopping cart functionality
- 💳 Checkout process
- 📦 Order history and tracking
- 🏆 Loyalty points system
- 📱 Responsive design for all devices

## Tech Stack

- **Frontend**: React, Next.js, TypeScript
- **Styling**: Tailwind CSS, Shadcn UI
- **Backend**: Supabase (PostgreSQL, Authentication, Storage)
- **Build Tool**: Vite
- **Routing**: React Router

## Setup Instructions

### Prerequisites

- Node.js (v16 or later)
- npm or yarn
- Supabase account

### Installation

1. Clone the repository
   ```sh
   git clone <repository-url>
   cd pizza-palace-next
   ```

2. Install dependencies
   ```sh
   npm install
   # or
   yarn
   ```

3. Set up environment variables
   Create a `.env` file in the root directory with the following variables:
   ```
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. Set up Supabase
   - Create a new Supabase project
   - Use the SQL scripts below to create the necessary tables
   - Ensure the RLS (Row Level Security) policies are configured correctly

   ```sql
   -- Create profiles table
   CREATE TABLE profiles (
     id UUID REFERENCES auth.users PRIMARY KEY,
     email TEXT UNIQUE,
     name TEXT,
     phone TEXT,
     address TEXT,
     loyalty_points INTEGER DEFAULT 0,
     created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
     updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
   );

   -- Create categories table
   CREATE TABLE categories (
     id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
     name TEXT NOT NULL,
     description TEXT,
     display_order INTEGER,
     created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
     updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
   );

   -- Create products table
   CREATE TABLE products (
     id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
     name TEXT NOT NULL,
     description TEXT,
     price DECIMAL(10, 2) NOT NULL,
     image_url TEXT,
     category UUID REFERENCES categories(id),
     available BOOLEAN DEFAULT true,
     created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
     updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
   );

   -- Create orders table
   CREATE TABLE orders (
     id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
     user_id UUID REFERENCES auth.users NOT NULL,
     status TEXT NOT NULL,
     total_amount DECIMAL(10, 2) NOT NULL,
     shipping_address TEXT,
     payment_intent_id TEXT,
     created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
     updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
   );

   -- Create order_items table
   CREATE TABLE order_items (
     id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
     order_id UUID REFERENCES orders(id) NOT NULL,
     product_id UUID REFERENCES products(id) NOT NULL,
     quantity INTEGER NOT NULL,
     unit_price DECIMAL(10, 2) NOT NULL,
     created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
   );
   ```

5. Start the development server
   ```sh
   npm run dev
   # or
   yarn dev
   ```

6. Open your browser and navigate to `http://localhost:5173` (or the port shown in your terminal)

## Authentication Setup

This project uses Supabase Authentication. To set it up:

1. Go to your Supabase project dashboard
2. Navigate to Authentication > Settings
3. Enable the Email/Password sign-up method
4. Configure any other authentication providers as needed

## Database Schema

The application uses the following tables in Supabase:

- **profiles**: User profile information
- **categories**: Menu categories (e.g., Veg Pizzas, Non-Veg Pizzas, Beverages, Combos)
- **products**: Pizza and other menu items
- **orders**: Customer orders
- **order_items**: Individual items in an order

## Assumptions and Challenges

### Assumptions

- Users have a stable internet connection
- Supabase is used as the primary backend service
- Product IDs are in UUID format to be compatible with Supabase's UUID column types
- Basic validation is sufficient for the MVP phase

### Challenges

- Implementing proper error handling for Supabase operations
- Managing state across multiple components
- Handling edge cases in the checkout process
- Ensuring data consistency between frontend and backend
- Dealing with UUID formatting for database compatibility

## Third-Party Libraries

Beyond the core Next.js, the project uses:

- **@supabase/supabase-js**: Supabase JavaScript client
- **react-router-dom**: For client-side routing
- **shadcn/ui**: Component library based on Radix UI and Tailwind
- **tailwindcss**: Utility-first CSS framework
- **lucide-react**: Icon library
- **date-fns**: Date manipulation library
- **react-hot-toast**: Toast notifications
- **zod**: TypeScript-first schema validation
- **clsx**: Utility for constructing className strings conditionally

## Deployment

This application can be deployed to any platform that supports Next.js applications, such as:

- Vercel
- Netlify
- Railway
- AWS Amplify

Make sure to set up the environment variables on your hosting platform.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
