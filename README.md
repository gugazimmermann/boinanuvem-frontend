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
- `npm test` - Run tests in watch mode
- `npm run test:ui` - Run tests with Vitest UI
- `npm run test:coverage` - Run tests and generate coverage report
- `npm run test:watch` - Run tests in watch mode

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
├── vite.config.ts         # Vite configuration (includes Vitest config)
├── react-router.config.ts # React Router configuration
├── tsconfig.json          # TypeScript configuration
├── vitest.d.ts            # Vitest type declarations
├── vitest.setup.ts        # Vitest setup file
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

## 🧪 Testing

The project uses **Vitest** for unit and integration testing with **React Testing Library** for component testing.

### Running Tests

Run all tests:
```bash
npm test
```

Run tests with UI (interactive mode):
```bash
npm run test:ui
```

Run tests and generate coverage report:
```bash
npm run test:coverage
```

Run tests in watch mode:
```bash
npm run test:watch
```

### Test Coverage

The project maintains comprehensive test coverage with **73 test files** and **642 passing tests** covering:
- **Components**: UI components, dashboard components, and site components
- **Hooks**: Custom React hooks (CEP lookup, CNPJ lookup, auto-rotate, smooth scroll)
- **Contexts**: Theme and language contexts
- **Utilities**: Helper functions and utilities
- **Types**: Type definitions and validations

Coverage reports are generated in the `coverage/` directory and can be viewed by opening `coverage/index.html` in a browser.

### Test Structure

Tests are located alongside their source files in `__tests__` directories:
```
app/
├── components/
│   ├── ui/
│   │   └── __tests__/     # UI component tests
│   ├── dashboard/
│   │   └── __tests__/     # Dashboard component tests
│   └── site/
│       └── __tests__/     # Site component tests
├── contexts/
│   └── __tests__/         # Context tests
├── hooks/
│   └── __tests__/         # Hook tests
└── utils/
    └── __tests__/         # Utility tests
```

### Testing Tools

- **Vitest** - Fast unit test framework
- **React Testing Library** - Component testing utilities
- **@testing-library/jest-dom** - Custom DOM matchers
- **@testing-library/user-event** - User interaction simulation
- **jsdom** - DOM implementation for Node.js testing environment

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

### Testing
- **Vitest** - Fast unit test framework
- **React Testing Library** - Component testing utilities
- **@testing-library/jest-dom** - Custom DOM matchers
- **@testing-library/user-event** - User interaction simulation
- **jsdom** - DOM implementation for Node.js testing
- **@vitest/coverage-v8** - Code coverage reporting
- **@vitest/ui** - Interactive test UI

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

