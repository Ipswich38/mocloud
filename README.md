# 🦷 MOCARDS - Dental Benefits Management System

A modern, streamlined dental benefits card management system for clinics and patients across the Philippines. Built with Next.js, TypeScript, and Supabase.

![MOCARDS Banner](https://via.placeholder.com/800x200/3B82F6/FFFFFF?text=MOCARDS+Dental+Benefits+Management)

## 🌟 Features

### 🔍 **Public Card Lookup**
- Instant card verification by 12-character code
- View patient benefits and clinic information
- Mobile-optimized interface for easy access

### 🏥 **Clinic Management**
- Complete patient card overview
- Appointment request management
- Benefit redemption tracking
- Regional clinic network support

### 👨‍💼 **Admin Portal** *(Planned)*
- Bulk card generation
- Clinic registration and management
- System analytics and reporting
- User role management

### 📱 **Mobile-First Design**
- Responsive interface for all devices
- Touch-friendly interactions
- Progressive Web App capabilities

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account

### 1. Clone & Install

```bash
git clone https://github.com/Ipswich38/mocloud.git
cd mocloud
npm install
```

### 2. Set Up Environment

```bash
cp .env.local.example .env.local
```

Add your Supabase credentials:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Set Up Database

1. Create a new Supabase project at [supabase.com](https://supabase.com)
2. Go to SQL Editor in your dashboard
3. Copy and run the SQL from `database/schema.sql`

### 4. Run Development Server

```bash
npm run dev
```

Visit `http://localhost:3000` to see the application.

## 🏗️ Tech Stack

### Frontend
- **Next.js 16.1.1** - React framework with App Router
- **TypeScript** - Type safety and developer experience
- **Tailwind CSS v4** - Utility-first CSS framework
- **shadcn/ui** - Beautiful, accessible component library
- **Lucide React** - Clean, customizable icons

### Backend & Database
- **Supabase** - PostgreSQL database with real-time capabilities
- **Row Level Security** - Built-in authorization
- **TypeScript SDK** - End-to-end type safety

### Architecture
- **Modular OOP Design** - Service-based architecture
- **Component-Driven Development** - Reusable UI components
- **Form Validation** - Zod schemas with react-hook-form
- **Mobile-First** - Progressive enhancement approach

## 📊 Database Schema

### Core Tables

| Table | Description |
|-------|-------------|
| `regions` | Philippine regions (CVT, BTG, LGN, MIM) |
| `clinic_codes` | Available clinic codes (001-016 per region) |
| `clinics` | Registered dental clinics |
| `cards` | Patient dental benefit cards |
| `card_perks` | Benefits associated with each card |
| `appointments` | Appointment requests and scheduling |
| `perk_redemptions` | Audit trail for benefit usage |
| `user_profiles` | User roles and clinic associations |

### Security Features

- **Row Level Security (RLS)** on all tables
- **Role-based access control** (admin, clinic, public)
- **Automatic user profile creation** on signup
- **Audit trails** for sensitive operations

## 🌏 Regional Coverage

MOCARDS serves dental clinics across:

- **Cavite (CVT)** - CVT001 to CVT016
- **Batangas (BTG)** - BTG001 to BTG016
- **Laguna (LGN)** - LGN001 to LGN016
- **MIMAROPA (MIM)** - MIM001 to MIM016

Each region supports up to 16 dental clinics with unique clinic codes.

## 📱 Usage Examples

### Card Lookup
```
Card Code: MC1234567890
→ Displays patient info, clinic details, available benefits
```

### Appointment Booking
```
1. Enter card code
2. Select preferred date & time
3. Specify purpose of visit
4. Submit request to clinic
```

## 🔧 Development

### Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── layout.tsx         # Root layout with auth provider
│   └── page.tsx           # Homepage with card lookup
├── components/
│   ├── ui/                # shadcn/ui components
│   ├── cards/             # Card-related components
│   └── layout/            # Layout components
├── lib/
│   ├── database/          # Service classes (OOP)
│   ├── auth/              # Authentication utilities
│   ├── validation/        # Zod schemas
│   └── utils/             # Utility functions
├── types/                 # TypeScript definitions
├── constants/             # App constants
└── hooks/                 # Custom React hooks
```

### Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
```

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | ✅ |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key | ✅ |
| `NEXT_PUBLIC_APP_URL` | Application URL | Optional |

## 🚀 Deployment

### Deploy to Vercel (Recommended)

```bash
npm install -g vercel
vercel
```

Set environment variables in Vercel dashboard.

### Deploy to Other Platforms

The app can be deployed to any platform supporting Node.js:
- Netlify
- Railway
- DigitalOcean App Platform
- AWS Amplify

## 🔒 Security

- ✅ Input validation with Zod schemas
- ✅ SQL injection prevention via Supabase
- ✅ XSS protection with sanitization
- ✅ Row Level Security policies
- ✅ Environment variable validation
- ✅ HTTPS-only in production

## 📋 Roadmap

### Phase 1: Core Features ✅
- [x] Public card lookup
- [x] Basic card management
- [x] Appointment requests
- [x] Mobile-responsive design

### Phase 2: Management Portals 🚧
- [ ] Admin portal for system management
- [ ] Clinic portal for appointment management
- [ ] Bulk card generation
- [ ] Advanced analytics

### Phase 3: Advanced Features 📋
- [ ] Real-time notifications
- [ ] SMS/Email integration
- [ ] QR code generation
- [ ] Mobile app
- [ ] API for third-party integrations

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Support

- **Email**: support@mocards.com
- **Phone**: +63 (2) 8123-4567
- **Documentation**: [docs.mocards.com](https://docs.mocards.com)
- **Issues**: [GitHub Issues](https://github.com/Ipswich38/mocloud/issues)

## 🙏 Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- Powered by [Supabase](https://supabase.com/)
- UI components by [shadcn/ui](https://ui.shadcn.com/)
- Icons by [Lucide](https://lucide.dev/)
- Styled with [Tailwind CSS](https://tailwindcss.com/)

---

**MOCARDS** - Making dental care more accessible and organized across the Philippines 🇵🇭
