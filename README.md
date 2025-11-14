# Boi na Nuvem - Frontend

A modern, full-stack React application built with React Router v7, featuring a comprehensive dashboard for livestock management, team collaboration, and property management.

## 🚀 Features

### Core Features
- **Modern Stack**: Built with React Router v7, React 19, TypeScript, and Vite
- **Server-Side Rendering (SSR)**: Optimized for performance and SEO
- **Multi-Language Support**: Internationalization (i18n) with support for Portuguese (pt), English (en), and Spanish (es)
- **Theme Support**: Dark and light mode with system preference detection
- **Responsive Design**: Mobile-first design with Tailwind CSS v4
- **Type Safety**: Full TypeScript support with strict mode

### Livestock Management
- **Animal Management**: Complete animal registration, editing, and tracking
- **Birth Records**: Track and manage animal births
- **Acquisitions**: Record and manage animal acquisitions
- **Weighings**: Track animal weight measurements over time
- **Location Movements**: Monitor animal movements between locations

### Property & Location Management
- **Properties**: Manage multiple properties with detailed information
- **Locations**: Track specific locations within properties
- **Interactive Maps**: Visual property and location mapping with Leaflet
- **Location Observations**: Record observations for locations

### People & Business Management
- **Employees**: Manage employee records and information
- **Service Providers**: Track service provider relationships
- **Suppliers**: Manage supplier information and relationships
- **Buyers**: Track buyer information and transactions

### User & Team Management
- **Authentication**: Complete authentication flow (login, register, password recovery)
- **Team Management**: User management with permissions and role-based access
- **Profile Management**: User and company profile management with activity logs
- **Permissions System**: Granular permission management for team members

### Dashboard & Analytics
- **Comprehensive Dashboard**: Overview with key metrics and statistics
- **Data Visualization**: Charts and graphs using Recharts
- **Activity Logs**: Track user and system activities
- **Pasture Planning**: Visual planning tools for pasture management

## 📋 Prerequisites

- Node.js 20 or higher
- npm (comes with Node.js)

## 🛠️ Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd boinanuvem-frontend
```

2. Install dependencies:
```bash
npm install
```

## 🏃 Development

Start the development server with Hot Module Replacement (HMR):

```bash
npm run dev
```

The application will be available at `http://localhost:5173`.

### Available Scripts

- `npm run dev` - Start development server with Hot Module Replacement (HMR)
- `npm run build` - Build for production (creates optimized SSR build)
- `npm run start` - Start production server (requires build first)
- `npm run typecheck` - Run TypeScript type checking (generates React Router types and validates TypeScript)
- `npm run lint` - Run ESLint to check code quality
- `npm run lint:fix` - Run ESLint and automatically fix issues
- `npm run format` - Format code using Prettier
- `npm run format:check` - Check code formatting without making changes

## 🏗️ Project Structure

```
boinanuvem-frontend/
├── app/
│   ├── components/          # Reusable UI components
│   │   ├── dashboard/       # Dashboard-specific components
│   │   │   ├── navbar/     # Navigation bar components
│   │   │   ├── sidebar/    # Sidebar navigation
│   │   │   ├── profile/     # Profile management components
│   │   │   ├── team/       # Team management components
│   │   │   └── utils/      # Dashboard utilities
│   │   ├── site/           # Public site components
│   │   │   ├── hooks/      # Custom hooks (CEP lookup, CNPJ lookup, etc.)
│   │   │   ├── ui/         # Site-specific UI components
│   │   │   └── utils/      # Site utilities (masks, geocoding, etc.)
│   │   └── ui/             # Base UI components (tables, modals, inputs, etc.)
│   ├── contexts/           # React contexts (theme, language)
│   ├── i18n/               # Internationalization
│   │   └── translations/   # Translation files (pt, en, es)
│   ├── mocks/              # Mock data for development
│   ├── routes/             # Route components
│   │   ├── dashboard/      # Dashboard route components
│   │   └── *.tsx          # Public routes (home, login, register, etc.)
│   ├── types/              # TypeScript type definitions
│   ├── utils/              # Utility functions
│   ├── root.tsx           # Root layout component
│   ├── routes.ts          # Route configuration
│   └── routes.config.ts   # Route constants and helpers
├── public/                 # Static assets (images, flags, favicon)
├── build/                  # Production build output (generated)
│   ├── client/            # Client-side assets
│   └── server/            # Server-side code
├── Dockerfile             # Docker configuration
├── vite.config.ts         # Vite configuration
├── react-router.config.ts # React Router configuration
├── tsconfig.json          # TypeScript configuration
└── eslint.config.js       # ESLint configuration
```

## 🌐 Internationalization

The application supports multiple languages:
- Portuguese (pt) - Default
- English (en)
- Spanish (es)

Language files are located in `app/i18n/translations/`. The language context provides translation hooks throughout the application.

## 🎨 Theming

The application supports both light and dark themes with automatic system preference detection. Theme preferences are persisted in localStorage.

## 🐳 Docker Deployment

### Build Docker Image

```bash
docker build -t boinanuvem-frontend .
```

### Run Container

```bash
docker run -p 3000:3000 boinanuvem-frontend
```

The application will be available at `http://localhost:3000`.

### Docker Multi-Stage Build

The Dockerfile uses a multi-stage build process:
1. **development-dependencies-env**: Installs all dependencies
2. **production-dependencies-env**: Installs production dependencies only
3. **build-env**: Builds the application
4. **Final stage**: Creates minimal production image

## 📦 Production Build

Create a production build:

```bash
npm run build
```

The build output will be in the `build/` directory:
```
build/
├── client/    # Static assets
└── server/    # Server-side code
```

### Running Production Build

```bash
npm run start
```

## 🚢 Deployment

### Platform Options

The containerized application can be deployed to any platform that supports Docker:

- **AWS ECS** - Elastic Container Service
- **Google Cloud Run** - Serverless container platform
- **Azure Container Apps** - Managed container platform
- **Digital Ocean App Platform** - Platform-as-a-Service
- **Fly.io** - Global application platform
- **Railway** - Modern deployment platform

### Environment Variables

Make sure to configure the following environment variables for production:

- `NODE_ENV=production` - Set to production mode
- Any API endpoints or service URLs your application requires
- Additional environment-specific configuration as needed

## 🧪 Code Quality

### Type Checking

Run TypeScript type checking:

```bash
npm run typecheck
```

This command generates React Router types and runs the TypeScript compiler.

### Linting

Check code quality with ESLint:

```bash
npm run lint
```

Automatically fix linting issues:

```bash
npm run lint:fix
```

### Code Formatting

Format code with Prettier:

```bash
npm run format
```

Check formatting without making changes:

```bash
npm run format:check
```

## 📚 Technologies

### Core Framework
- **React Router v7** - Full-stack React framework with SSR support
- **React 19** - UI library
- **TypeScript 5.9** - Type safety and developer experience
- **Vite 7** - Build tool and dev server

### Styling & UI
- **Tailwind CSS v4** - Utility-first CSS framework
- **Custom UI Components** - Reusable component library

### Data & Visualization
- **Recharts** - Chart and graph library for data visualization
- **Leaflet** - Interactive maps for property and location visualization
- **date-fns** - Date utility library

### Development Tools
- **ESLint** - Code linting and quality checks
- **Prettier** - Code formatting
- **TypeScript ESLint** - TypeScript-specific linting rules

### Runtime
- **Node.js 20** - Runtime environment

## 📝 License

[Add your license information here]

## 👥 Contributing

[Add contributing guidelines here]

---

Built with ❤️ using React Router and modern web technologies.

