# Boi na Nuvem - Frontend

A modern, full-stack React application built with React Router v7, featuring a comprehensive dashboard for livestock management, team collaboration, and property management.

## 🚀 Features

- **Modern Stack**: Built with React Router v7, React 19, TypeScript, and Vite
- **Server-Side Rendering (SSR)**: Optimized for performance and SEO
- **Multi-Language Support**: Internationalization (i18n) with support for Portuguese (pt), English (en), and Spanish (es)
- **Theme Support**: Dark and light mode with system preference detection
- **Dashboard**: Comprehensive dashboard with navigation, sidebar, and user management
- **Authentication**: Complete authentication flow (login, register, password recovery)
- **Team Management**: User management with permissions and role-based access
- **Profile Management**: User and company profile management with activity logs
- **Property Management**: Property listing and management features
- **Responsive Design**: Mobile-first design with Tailwind CSS
- **Type Safety**: Full TypeScript support with strict mode

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

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server (requires build first)
- `npm run typecheck` - Run TypeScript type checking

## 🏗️ Project Structure

```
boinanuvem-frontend/
├── app/
│   ├── components/          # Reusable UI components
│   │   ├── dashboard/       # Dashboard-specific components
│   │   ├── site/           # Public site components
│   │   └── ui/             # Base UI components
│   ├── contexts/           # React contexts (theme, language)
│   ├── i18n/               # Internationalization
│   ├── routes/             # Route components
│   ├── types/              # TypeScript type definitions
│   └── root.tsx           # Root layout component
├── public/                 # Static assets
├── Dockerfile             # Docker configuration
└── vite.config.ts         # Vite configuration
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

- `NODE_ENV=production`
- Any API endpoints or service URLs your application requires

## 🧪 Type Checking

Run TypeScript type checking:

```bash
npm run typecheck
```

This command generates React Router types and runs the TypeScript compiler.

## 📚 Technologies

- **React Router v7** - Full-stack React framework
- **React 19** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Tailwind CSS v4** - Utility-first CSS framework
- **Node.js 20** - Runtime environment

## 📝 License

[Add your license information here]

## 👥 Contributing

[Add contributing guidelines here]

---

Built with ❤️ using React Router and modern web technologies.

