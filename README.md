# Boi na Nuvem Frontend

**Complete cattle farm management system for beef cattle operations**

🌐 **Live Website:** [https://www.boinanuvem.com.br/](https://www.boinanuvem.com.br/)

Boi na Nuvem is a modern, comprehensive web platform for managing rural properties specialized in beef cattle operations. The system provides complete control over properties, pastures, animals, reproduction, finances, inventory, and sales—all integrated into a single platform with advanced analytics and detailed reports.

## Table of Contents

- [Overview](#overview)
- [Key Features](#key-features)
- [Architecture & Technical Stack](#architecture--technical-stack)
- [Project Structure](#project-structure)
- [Core Features Documentation](#core-features-documentation)
- [Development Setup](#development-setup)
- [API Architecture](#api-architecture)
- [Routing System](#routing-system)
- [Authentication & Authorization](#authentication--authorization)
- [Internationalization](#internationalization)
- [Theming System](#theming-system)
- [Testing](#testing)
- [Code Quality & Linting](#code-quality--linting)
- [Build & Deployment](#build--deployment)
- [Development Workflow](#development-workflow)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)
- [Support](#support)

## Overview

### Purpose

Boi na Nuvem is designed to digitize and streamline cattle farm management operations. It serves as a comprehensive solution for farm owners, managers, and agricultural professionals who need to track, analyze, and optimize their cattle operations.

### Target Audience

- **Farm Owners**: Manage multiple properties and track overall farm performance
- **Farm Managers**: Oversee daily operations, animal health, and financial management
- **Veterinarians**: Track animal health records, vaccinations, and treatments
- **Financial Managers**: Monitor cash flow, accounts payable/receivable, and profitability
- **Agricultural Consultants**: Analyze production data and provide recommendations

### Key Value Propositions

1. **Complete Integration**: All farm management aspects in one unified platform
2. **Real-time Analytics**: Advanced dashboards with actionable insights
3. **Scalability**: Support for multiple properties and large herds
4. **User-friendly Interface**: Intuitive design with dark mode support
5. **Mobile-responsive**: Access from any device, anywhere
6. **Data-driven Decisions**: Comprehensive reports and profitability analysis
7. **Team Collaboration**: Granular permission system for multi-user environments

## Key Features

### Property & Location Management
- Multi-property support with complete address and geolocation data
- Pasture organization (pastures, corrals, barns)
- Interactive maps integration (Leaflet)
- Climate-based pasture planning
- Breeding season configuration
- Capacity monitoring and pasture rotation management

### Animal Management
- Complete animal registration with genetic history
- Weight tracking over time with growth trend analysis
- Vaccination and treatment history
- Movement tracking between pastures
- Daily weight gain (GMD) calculations
- Animal lifecycle management (birth to sale/death)

### Reproduction Management
- Breeding records and tracking
- Pregnancy monitoring and confirmation
- Unconfirmed breeding management
- Birth forecasting based on breeding dates
- Reproductive indexes (fertility rate, birth rate, calving interval)
- Genetic management and lineage tracking

### Financial Management
- Cash flow tracking (income and expenses)
- Accounts payable and receivable
- Multiple bank account management
- Financial dashboard with visual analytics
- Profitability analysis per animal and per lot
- ROI calculations
- Payment scheduling and tracking

### Inventory Management
- Stock tracking for feed, medications, and supplies
- Inventory movement history
- Consumption analysis by location
- Cost calculation per animal
- Consumption analysis based on animal presence in pastures
- Low stock alerts and reorder management

### Sales & Analytics
- Sales records with multiple modalities (slaughterhouse, other farms, auctions)
- Complete profitability analysis
- Cost per arroba calculations
- Sale price, spread, and profit margin analysis
- ROI calculations
- Complete sales history with advanced metrics
- Sales analytics dashboard

### Team Management
- User management and profiles
- Granular permission system (per-section, per-resource, per-action)
- Activity logs
- Employee, service provider, supplier, and buyer management
- Main user vs. regular user distinction

### Dashboards & Reports
- Main dashboard with general metrics
- Property-level dashboard
- Animal-level dashboard
- Financial dashboard
- Profitability analyses
- Interactive visualizations with charts (Recharts)
- Export capabilities

## Architecture & Technical Stack

### Frontend Framework

**React Router v7.9** with Server-Side Rendering (SSR)
- Full-stack framework with file-based routing
- Built-in data loading with loaders
- Error boundaries and fallbacks
- Type-safe route definitions

**React 19.1**
- Latest React features with concurrent rendering
- Context API for state management
- Custom hooks for reusable logic

### State Management

The application uses React Context API for global state:

- **AuthContext**: User authentication and session management
- **ThemeContext**: Dark/light mode theme switching
- **LanguageContext**: Internationalization and language preferences

### Styling

**Tailwind CSS v4.1**
- Utility-first CSS framework
- Dark mode support with system preference detection
- Responsive design utilities
- Custom theme configuration

### Data Visualization

- **Recharts**: Interactive charts and graphs for analytics
- **Leaflet**: Interactive maps for property and location visualization

### API Layer

**Custom ApiClient Pattern**
- Centralized HTTP client with error handling
- Service layer architecture (40+ services)
- Type-safe request/response handling
- Base service utilities for CRUD operations

### Type Safety

**TypeScript 5.9.2**
- Strict mode enabled
- Complete type coverage
- Type-safe route definitions
- Comprehensive type definitions for all entities

### Build Tool

**Vite 7.1**
- Fast development server with HMR
- Optimized production builds
- React Router plugin integration
- TypeScript path aliases support

### Testing

**Vitest 4.0**
- Fast unit and integration testing
- Testing Library for component testing
- Coverage reporting with v8
- Test utilities and mocks

### Code Quality

- **ESLint 9**: Code linting with TypeScript and React plugins
- **Prettier 3**: Code formatting
- **SonarQube**: Static code analysis
- **Husky**: Git hooks for pre-commit checks

### DevOps

- **Docker**: Multi-stage builds for production
- **Node.js 20**: Runtime environment
- **Render.com**: Deployment platform

## Project Structure

```
boinanuvem-frontend/
├── app/                          # Main application code
│   ├── components/               # React components
│   │   ├── dashboard/           # Dashboard-specific components
│   │   │   ├── [181 files]     # 157 TSX, 24 TS files
│   │   ├── site/                # Public site components
│   │   │   ├── [82 files]       # 56 TSX, 26 TS files
│   │   └── ui/                  # Reusable UI components
│   │       ├── [47 files]       # 46 TSX, 1 TS file
│   ├── contexts/                # React Context providers
│   │   ├── auth-context.tsx     # Authentication context
│   │   ├── language-context.tsx # Internationalization context
│   │   └── theme-context.tsx    # Theme management context
│   ├── hooks/                    # Custom React hooks
│   │   ├── [41 hooks]           # Reusable business logic hooks
│   ├── i18n/                     # Internationalization
│   │   ├── translations/        # Translation files (pt, en, es)
│   │   ├── index.ts             # i18n configuration
│   │   └── use-translation.ts   # Translation hook
│   ├── mocks/                    # Mock data for development/testing
│   │   ├── [35 mock files]      # Entity mock data
│   ├── routes/                   # React Router routes
│   │   ├── dashboard/           # Dashboard routes
│   │   │   ├── [82 route files] # Feature-specific routes
│   │   ├── api.invoices.$invoiceId.tsx
│   │   ├── dashboard.tsx        # Dashboard layout route
│   │   ├── home.tsx             # Home page route
│   │   ├── login.tsx            # Login route
│   │   └── [other public routes]
│   ├── services/                # API service layer
│   │   ├── [42 service files]   # Entity-specific services
│   │   ├── api-client.ts        # Base API client
│   │   └── base-service.ts     # Base service utilities
│   ├── types/                    # TypeScript type definitions
│   │   ├── [49 type files]      # Entity and utility types
│   ├── utils/                    # Utility functions
│   │   ├── [84 utility files]   # Helper functions and utilities
│   ├── root.tsx                  # Root component and layout
│   ├── routes.config.ts          # Route constants and helpers
│   └── routes.ts                 # Route configuration
├── build/                        # Production build output
│   ├── client/                   # Client-side assets
│   └── server/                   # Server-side code
├── coverage/                     # Test coverage reports
├── public/                       # Static public assets
│   ├── flags/                    # Country flag images
│   ├── images/                   # Application images
│   └── robots.txt
├── docker-compose.yml            # Docker Compose configuration
├── Dockerfile                    # Docker production build
├── eslint.config.js              # ESLint configuration
├── package.json                  # Dependencies and scripts
├── react-router.config.ts        # React Router configuration
├── render.yaml                   # Render.com deployment config
├── sonar-project.properties      # SonarQube configuration
├── tsconfig.json                 # TypeScript configuration
├── vite.config.ts                # Vite configuration
└── vitest.setup.ts               # Vitest setup file
```

### Component Organization

**Dashboard Components** (`app/components/dashboard/`)
- Organized by feature domain (properties, animals, finances, etc.)
- Shared components for lists, forms, and detail views
- Reusable UI patterns

**Site Components** (`app/components/site/`)
- Public-facing components (homepage, pricing, etc.)
- Marketing and informational pages
- SEO-optimized components

**UI Components** (`app/components/ui/`)
- Reusable, generic UI components
- Form inputs, buttons, modals, etc.
- Design system components

### Service Layer Architecture

Services follow a consistent pattern:
- Entity-specific service files (e.g., `animals.service.ts`)
- Base service utilities for common CRUD operations
- Type-safe API client for HTTP requests
- Error handling and response transformation

### Route Configuration

Routes are centrally defined in `routes.config.ts`:
- Type-safe route constants
- Helper functions for dynamic route generation
- Route permission mapping
- Route action mapping (view, create, edit, delete)

## Core Features Documentation

### Property & Location Management

**Properties**
- Multi-property support with unique codes and names
- Complete address information with geolocation
- Area tracking (hectares)
- Status management (active/inactive)
- Pasture planning configuration
- Breeding season configuration

**Locations**
- Hierarchical organization within properties
- Location types: pastures, corrals, barns, etc.
- Capacity tracking
- Inventory movement tracking per location
- Cost analysis per location

**Pasture Planning**
- Monthly pasture quality classification
- Climate-based planning
- User customization support
- Visual planning interface

### Animal Management

**Animal Registration**
- Complete animal profiles with identification codes
- Genetic information and lineage tracking
- Property and location assignment
- Status tracking (active, sold, deceased)

**Weight Tracking**
- Historical weight records
- Daily weight gain (GMD) calculations
- Growth trend analysis
- Visual weight charts

**Health Records**
- Vaccination history
- Treatment records
- Sanitary control tracking
- Medication administration logs

**Animal Movements**
- Movement history between locations
- Movement reasons and notes
- Date and time tracking
- Location-based analytics

### Reproduction Management

**Breeding Records**
- Breeding date and bull information
- Cow pregnancy status
- Breeding confirmation tracking
- Unconfirmed breeding management

**Pregnancy Management**
- Pregnancy confirmation and tracking
- Expected calving dates
- Pregnancy status dashboard
- Reproductive health monitoring

**Birth Forecasting**
- Automated birth date calculations
- Breeding-based predictions
- Calendar view of expected births
- Preparation reminders

**Reproductive Indexes**
- Fertility rate calculations
- Birth rate metrics
- Calving interval analysis
- Culling rate tracking
- Comprehensive reproductive reports

### Financial Management

**Cash Flow**
- Income and expense tracking
- Transaction categorization
- Date-based filtering and reporting
- Cash flow visualization

**Accounts Payable**
- Bill tracking and scheduling
- Payment status management
- Due date monitoring
- Payment history

**Accounts Receivable**
- Invoice tracking
- Payment collection management
- Overdue account alerts
- Receivable analytics

**Bank Accounts**
- Multiple account management
- Account balance tracking
- Transaction reconciliation
- Account-specific reporting

**Financial Analytics**
- Profitability analysis per animal
- Cost per arroba calculations
- ROI analysis
- Financial dashboard with key metrics
- Revenue and expense trends

### Inventory Management

**Inventory Items**
- Complete item catalog (feed, medications, supplies)
- Unit of measurement tracking
- Stock level monitoring
- Cost tracking

**Inventory Movements**
- Stock in/out transactions
- Location-based movements
- Consumption tracking
- Movement history and audit trail

**Consumption Analysis**
- Consumption by location
- Consumption by animal
- Time-based consumption trends
- Cost analysis per animal

### Sales & Analytics

**Sales Records**
- Multiple sale modalities (slaughterhouse, farms, auctions)
- Buyer information
- Sale date and pricing
- Animal lot management

**Profitability Analysis**
- Cost per arroba calculation
- Sale price analysis
- Spread and margin calculations
- ROI per sale and per animal

**Sales Analytics**
- Sales history and trends
- Revenue analysis
- Buyer performance
- Sales dashboard with key metrics

### Team Management

**User Management**
- User profiles and authentication
- Role assignment
- Team member management
- User activity tracking

**Permission System**
- Granular permissions (section.resource.action)
- Permission categories:
  - Registration (properties, locations, employees, etc.)
  - Records (births, acquisitions, sales, etc.)
  - Breedings (breeding records, reproductive indexes)
  - Finances (cash flow, accounts payable/receivable)
  - Reports (analytics, financial reports, etc.)
- Main user vs. regular user distinction
- Permission inheritance and defaults

### Dashboards

**Main Dashboard**
- Overview metrics and KPIs
- Quick access to key features
- Recent activity feed
- System-wide statistics

**Property Dashboard**
- Property-specific metrics
- Animal count and status
- Financial summary
- Production indexes

**Animal Dashboard**
- Individual animal details
- Health and weight history
- Financial performance
- Related records and movements

**Financial Dashboard**
- Cash flow overview
- Accounts payable/receivable summary
- Profitability metrics
- Financial trends and charts

## Development Setup

### Prerequisites

- **Node.js** 20 or higher
- **npm** (comes with Node.js) or **yarn**
- **Git** for version control
- **Docker** (optional, for containerized development)

### Installation

1. **Clone the repository:**
```bash
git clone <repository-url>
cd boinanuvem-frontend
```

2. **Install dependencies:**
```bash
npm install
```

3. **Configure environment variables:**
```bash
# Create .env file if needed (currently using default API_BASE_URL)
# API_BASE_URL=http://localhost:3000/api
```

4. **Start the development server:**
```bash
npm run dev
```

The application will be available at `http://localhost:5173`

### Docker Setup

**Development:**
```bash
docker-compose up
```

**Production Build:**
```bash
# Build the image
docker build -t boinanuvem-frontend .

# Run the container
docker run -p 3000:3000 boinanuvem-frontend
```

### Common Development Tasks

**Type Checking:**
```bash
npm run typecheck
```

**Linting:**
```bash
npm run lint
npm run lint:fix  # Auto-fix issues
```

**Code Formatting:**
```bash
npm run format
npm run format:check  # Check without fixing
```

**Running Tests:**
```bash
npm run test          # Watch mode
npm run test:run      # Single run
npm run test:coverage # With coverage
npm run test:ui       # Visual interface
```

## API Architecture

### ApiClient Pattern

The application uses a centralized API client (`app/services/api-client.ts`) that provides:

- **Type-safe HTTP methods**: GET, POST, PUT, DELETE
- **Error handling**: Custom `ApiError` class with status codes
- **Request/Response types**: Generic type parameters for type safety
- **Base URL configuration**: Configurable API endpoint
- **Automatic token management**: JWT access tokens automatically included in request headers
- **Automatic token refresh**: Automatically refreshes access tokens on 401 responses
- **Token storage**: Manages access and refresh tokens in localStorage
- **Auth failure handling**: Automatic logout and redirect on authentication failure

**Example Usage:**
```typescript
import { apiClient } from '~/services/api-client';

// GET request
const animals = await apiClient.get<Animal[]>('/animals', { companyId: '123' });

// POST request
const newAnimal = await apiClient.post<Animal>('/animals', animalData);

// PUT request
await apiClient.put<Animal>(`/animals/${id}`, updatedData);

// DELETE request
await apiClient.delete(`/animals/${id}`);
```

### Service Layer Structure

The service layer consists of 42 entity-specific services, each following a consistent pattern:

**Service Pattern:**
```typescript
// Example: animals.service.ts
export function getAnimalById(id: string): Animal | undefined
export function getAnimalsByCompanyId(companyId: string): Animal[]
export function addAnimal(data: AnimalFormData): Animal
export function updateAnimal(id: string, data: Partial<AnimalFormData>): boolean
export function deleteAnimal(id: string): boolean
```

**Base Service Utilities** (`app/services/base-service.ts`):
- `findById`: Find entity by ID
- `findByField`: Find entities by field value
- `createEntity`: Create new entity with ID generation
- `updateEntity`: Update existing entity
- `deleteEntity`: Delete entity
- `generateNextId`: Generate sequential IDs

### Error Handling

**ApiError Class:**
```typescript
export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public response?: Response
  )
}
```

**Error Handling Pattern:**
- HTTP errors are caught and transformed into `ApiError` instances
- Status codes are preserved for proper error handling
- Error responses can be accessed for detailed error information
- 401 (Unauthorized) responses trigger automatic token refresh
- Failed token refresh triggers logout and redirect to login

**Token Management:**
- Access tokens are automatically included in `Authorization: Bearer <token>` header
- Refresh tokens are used to obtain new access tokens when expired
- Token refresh prevents infinite loops with `retryOn401` parameter
- Callback system allows AuthContext to respond to token refresh events
- All tokens are cleared on authentication failure

### Request/Response Types

All API interactions are fully typed:
- Request bodies use TypeScript interfaces
- Response types are explicitly defined
- Generic type parameters ensure type safety throughout the application

## Routing System

### React Router v7 Configuration

Routes are defined in `app/routes.ts` using React Router's file-based routing:

```typescript
export default [
  index("routes/home.tsx"),
  route("entrar", "routes/login.tsx"),
  route("dashboard", "routes/dashboard.tsx", [
    // Nested routes
  ]),
];
```

### Route Constants

All routes are centrally defined in `app/routes.config.ts`:

```typescript
export const ROUTES = {
  HOME: "/",
  LOGIN: "/entrar",
  DASHBOARD: "/dashboard",
  PROPERTIES: "/dashboard/propriedades",
  // ... 90+ route definitions
} as const;
```

### Route Helpers

Helper functions for dynamic route generation:

```typescript
// Property routes
getPropertyEditRoute(propertyId: string): string
getPropertyViewRoute(propertyId: string): string

// Generic entity routes
getAnimalEditRoute(id: string): string
getLocationViewRoute(id: string): string
// ... etc.
```

### Protected Routes

Routes are protected using route guards:

**Authentication Guard:**
- Checks for authenticated user
- Redirects to login if not authenticated

**Permission Guard:**
- Checks user permissions for specific routes
- Validates section.resource.action permissions
- Redirects to dashboard if access denied

**Main User Guard:**
- Restricts team management routes to main users only
- Regular users are redirected if attempting access

### Route Permission Mapping

Routes are mapped to permissions in `app/utils/route-permissions.ts`:

```typescript
// Example mapping
"/dashboard/propriedades" → "registration.property.view"
"/dashboard/propriedades/novo" → "registration.property.create"
"/dashboard/propriedades/:id/editar" → "registration.property.edit"
```

### Dynamic Route Generation

Routes support dynamic parameters:
- `:propertyId`, `:animalId`, `:locationId`, etc.
- Route helpers generate type-safe route paths
- Parameters are validated and typed

## Authentication & Authorization

### Authentication System

**JWT Token-Based Authentication**

The application uses a JWT (JSON Web Token) based authentication system with access tokens and refresh tokens for secure, stateless authentication.

**AuthContext** (`app/contexts/auth-context.tsx`):
- Manages current user session and authentication state
- Provides `login`, `logout`, `refreshTokens`, `getAccessToken`, `getRefreshToken`, and `isAuthenticated` functions
- Stores access token, refresh token, and user data in localStorage
- Integrates with API client for automatic token refresh
- Provides current user information throughout the app

**Token Storage:**
- `access_token`: JWT access token for API authentication (Bearer token)
- `refresh_token`: Refresh token for obtaining new access tokens
- `user_data`: Serialized user object with id, email, name, mainUser, companyId, permissions, and company

**Authentication Flow:**
1. User submits login credentials (email and password) with optional "Remember Me"
2. `authService.login()` sends credentials to `/auth/login` endpoint
3. Backend validates credentials and returns:
   - `access_token`: Short-lived JWT token for API requests
   - `refresh_token`: Long-lived token for refreshing access tokens
   - `user`: User object with profile and permission data
4. Tokens and user data are stored in localStorage
5. Tokens are set in API client for automatic inclusion in requests
6. AuthContext updates with user information
7. User is redirected to dashboard

**Token Refresh Mechanism:**
- API client automatically detects 401 (Unauthorized) responses
- On 401, the client attempts to refresh the access token using the refresh token
- If refresh succeeds, the original request is retried with the new access token
- If refresh fails, all tokens are cleared and user is redirected to login
- Prevents infinite refresh loops with `retryOn401` flag on refresh endpoint

**Session Management:**
- Access and refresh tokens stored in localStorage
- User data stored in localStorage for quick access
- Session persists across page refreshes
- Tokens are automatically included in API requests via `Authorization: Bearer <token>` header
- Logout calls backend to invalidate refresh token, then clears all local storage

**API Client Integration:**
- `ApiClient` (`app/services/api-client.ts`) handles all token management
- Automatic token injection in request headers
- Automatic token refresh on 401 responses
- Callback system for token refresh events
- Auth failure callback triggers logout and redirect

**Password Management:**
- **Forgot Password**: Request password reset email via `/auth/forgot-password`
- **Reset Password**: Reset password with token via `/auth/reset-password`
- **Setup Password**: Initial password setup for team members via `/auth/setup-password`
- **Change Password**: Change password for authenticated users via `/auth/change-password`

**Email Verification:**
- Email verification required for account activation
- Verify email via `/auth/verify-email` with token
- Resend verification email via `/auth/resend-verification` (requires authentication)
- Login blocked for unverified accounts with helpful error messages

### Authorization System

**Permission Structure:**
Permissions are organized hierarchically:
```
section.resource.action

Examples:
- registration.property.view
- records.sales.create
- finances.cashFlow.edit
- breedings.breedings.remove
```

**Permission Sections:**
- `registration`: Properties, locations, employees, suppliers, buyers, inventory, animals
- `records`: Births, acquisitions, weighings, sales, deaths, movements
- `breedings`: Breeding records, unconfirmed breedings, pregnant cows, indexes
- `finances`: Cash flow, accounts payable/receivable, bank accounts
- `reports`: Analytics, financial reports, animal reports, production reports

**Permission Actions:**
- `view`: Read access
- `create`: Create new records
- `edit`: Modify existing records
- `remove`: Delete records

**User Types:**
- **Main User**: Full access to all features, including team management
- **Regular User**: Access based on assigned permissions

**Permission Checking:**
```typescript
// Route guard example
createRouteGuard(
  ROUTES.PROPERTIES,
  'view' // Required action
)

// Component-level permission check
const canEdit = hasPermission('registration', 'property', 'edit', user);

// Using auth context
const { currentUser, isAuthenticated, getAccessToken } = useAuth();
const token = getAccessToken(); // Get current access token
```

### Route Guards

**createRouteGuard:**
- Validates user authentication
- Checks route-specific permissions
- Redirects unauthorized users
- Supports custom redirect destinations

**requireMainUser:**
- Restricts access to main users only
- Used for team management routes
- Automatically redirects regular users

**requireGuest:**
- Ensures user is not authenticated
- Used for login/register pages
- Redirects authenticated users to dashboard

### Authentication API Endpoints

**AuthService** (`app/services/auth.service.ts`) provides methods for all authentication operations:

- `login(email, password, rememberMe)`: Authenticate user and receive tokens
- `registerCompany(data)`: Register new company with main user
- `logout(refreshToken)`: Logout and invalidate refresh token on backend
- `refreshToken(refreshToken)`: Refresh access token using refresh token
- `forgotPassword(email)`: Request password reset email
- `resetPassword(token, password)`: Reset password with token
- `setupPassword(token, password)`: Setup initial password for team members
- `changePassword(currentPassword, newPassword)`: Change password for authenticated user
- `verifyEmail(token)`: Verify email address with token
- `resendVerification()`: Resend email verification (requires authentication)

**Error Handling:**
- 401 responses trigger automatic token refresh
- Invalid refresh tokens trigger logout and redirect
- Specific error messages for account verification, invalid credentials, etc.
- User-friendly error messages displayed in UI

## Internationalization

### i18n System Structure

**Translation Files** (`app/i18n/translations/`):
- `pt.ts`: Portuguese (default)
- `en.ts`: English
- `es.ts`: Spanish

**Translation Hook** (`app/i18n/use-translation.ts`):
```typescript
const { t } = useTranslation();
const title = t('common.loading'); // "Carregando..."
```

### Language Context

**LanguageProvider** (`app/contexts/language-context.tsx`):
- Manages current language selection
- Detects browser language preference
- Persists language choice in localStorage
- Updates document language attribute

**Supported Languages:**
- Portuguese (pt) - Default
- English (en)
- Spanish (es)

**Language Switching:**
```typescript
const { language, setLanguage, languageInfo } = useLanguage();
setLanguage('en'); // Switch to English
```

### Locale-Specific Formatting

- Date formatting using `date-fns` with locale support
- Number formatting based on language
- Currency formatting for financial data

## Theming System

### Theme Implementation

**ThemeContext** (`app/contexts/theme-context.tsx`):
- Manages light/dark theme state
- Detects system preference on first load
- Persists theme choice in localStorage
- Applies theme class to document root

**Theme Detection:**
```typescript
// System preference detection
const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

// Stored preference takes precedence
const theme = localStorage.getItem('theme') || (prefersDark ? 'dark' : 'light');
```

### Theme Usage

**Theme Hook:**
```typescript
const { theme, toggleTheme, setTheme } = useTheme();

// Toggle between light and dark
toggleTheme();

// Set specific theme
setTheme('dark');
```

### CSS Variable Usage

Tailwind CSS v4 uses CSS variables for theming:
- Dark mode classes automatically applied
- Smooth transitions between themes
- Consistent color scheme across components

### System Preference Detection

On first visit, the system:
1. Checks for stored theme preference
2. Falls back to system preference if no stored value
3. Applies theme immediately to prevent flash
4. Allows manual override at any time

## Testing

### Testing Strategy

The project uses **Vitest** for unit and integration testing with the following approach:

- **Unit Tests**: Test individual functions and utilities
- **Component Tests**: Test React components with Testing Library
- **Service Tests**: Test API service layer with mocks
- **Integration Tests**: Test route loaders and data flow

### Test Organization

Tests are co-located with source files in `__tests__` directories:

```
app/
├── components/
│   └── dashboard/
│       └── __tests__/
│           └── [component].test.tsx
├── hooks/
│   └── __tests__/
│       └── [hook].test.ts
├── services/
│   └── __tests__/
│       └── [service].test.ts
└── routes/
    └── __tests__/
        └── [route].test.tsx
```

### Running Tests

```bash
# Watch mode (development)
npm run test

# Single run
npm run test:run

# With coverage report
npm run test:coverage

# Visual test interface
npm run test:ui

# Watch specific file
npm run test -- animals.service.test.ts
```

### Test Utilities and Mocks

**Mock Data** (`app/mocks/`):
- Entity-specific mock data files
- Consistent data structure for testing
- 35+ mock data files covering all entities

**Test Setup** (`vitest.setup.ts`):
- Global test configuration
- Testing Library setup
- Mock service configuration

### Coverage Requirements

**Coverage Configuration:**
- Provider: v8
- Reporters: text, json, html, lcov
- Exclusions: node_modules, build, config files, types, translations

**Coverage Goals:**
- Maintain above 80% code coverage
- Focus on business logic and utilities
- Component tests for critical user flows

### Testing Library

**Component Testing:**
```typescript
import { render, screen } from '@testing-library/react';
import { AnimalList } from './AnimalList';

test('renders animal list', () => {
  render(<AnimalList animals={mockAnimals} />);
  expect(screen.getByText('Animal Name')).toBeInTheDocument();
});
```

**User Interaction Testing:**
```typescript
import userEvent from '@testing-library/user-event';

test('handles form submission', async () => {
  const user = userEvent.setup();
  render(<AnimalForm />);
  await user.type(screen.getByLabelText('Name'), 'New Animal');
  await user.click(screen.getByRole('button', { name: 'Submit' }));
  // Assertions...
});
```

## Code Quality & Linting

### ESLint Configuration

**Configuration** (`eslint.config.js`):
- TypeScript ESLint recommended rules
- React and React Hooks plugins
- Custom rules for unused variables
- Ignores: build, node_modules, config files

**Key Rules:**
- React in JSX scope: off (React 19)
- Prop types: off (using TypeScript)
- Unused vars: warn (with ignore patterns for `_` prefix)

### Prettier Setup

**Formatting:**
- Automatic code formatting on save
- Consistent code style across the project
- Format check in CI/CD pipeline

**Configuration:**
- Default Prettier settings
- Formats: TypeScript, TSX, JavaScript, JSON, CSS, Markdown

### TypeScript Strict Mode

**Strict Configuration:**
- `strict: true` in tsconfig.json
- All strict type checking enabled
- No implicit any
- Strict null checks
- Strict function types

### SonarQube Integration

**Configuration** (`sonar-project.properties`):
- Code quality analysis
- Security vulnerability detection
- Code smell identification
- Technical debt tracking

**Running Analysis:**
```bash
npm run sonar          # Run SonarQube analysis
npm run sonar:test     # Run tests with coverage + analysis
```

### Pre-commit Hooks

**Husky** (`package.json`):
- Pre-commit hook setup
- Runs linting and formatting checks
- Prevents commits with linting errors

## Build & Deployment

### Production Build Process

**Build Command:**
```bash
npm run build
```

**Build Output:**
- `build/client/`: Client-side assets (HTML, CSS, JS)
- `build/server/`: Server-side code for SSR
- Optimized and minified for production

### SSR Configuration

**React Router SSR:**
- Server-side rendering enabled in `react-router.config.ts`
- Improved initial load performance
- SEO optimization
- Hydration on client side

### Docker Multi-stage Build

**Dockerfile Stages:**
1. **development-dependencies-env**: Install all dependencies
2. **production-dependencies-env**: Install production dependencies only
3. **build-env**: Build the application
4. **Final stage**: Copy production files and dependencies

**Build Optimization:**
- Separate dependency installation stages
- Production dependencies only in final image
- Reduced image size
- Faster build times

### Render.com Deployment

**Configuration** (`render.yaml`):
- Web service type
- Docker runtime
- Environment variables
- Health check path
- Port configuration (10000)

**Environment Variables:**
- `NODE_ENV=production`
- `PORT=10000`

### Production Server

**Start Command:**
```bash
npm run start
```

Uses `@react-router/serve` to serve the built application with SSR support.

## Development Workflow

### Branch Strategy

- **main**: Production-ready code
- **develop**: Integration branch for features
- **feature/**: Feature development branches
- **fix/**: Bug fix branches
- **hotfix/**: Critical production fixes

### Commit Conventions

Follow conventional commits:
- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation changes
- `style:` Code style changes
- `refactor:` Code refactoring
- `test:` Test additions/changes
- `chore:` Maintenance tasks

### Pull Request Process

1. Create feature branch from `develop`
2. Implement changes with tests
3. Ensure all tests pass
4. Run linting and formatting
5. Create pull request with description
6. Code review and approval
7. Merge to `develop`
8. Deploy to staging for testing
9. Merge to `main` for production

### Code Review Guidelines

**Review Checklist:**
- Code follows project style guide
- Tests are included and passing
- No linting errors
- TypeScript types are correct
- Documentation updated if needed
- Performance considerations addressed
- Security best practices followed

### Release Process

1. Update version in `package.json`
2. Update CHANGELOG.md
3. Create release branch
4. Run full test suite
5. Build production bundle
6. Deploy to production
7. Tag release in Git
8. Merge back to `develop` and `main`

## Troubleshooting

### Common Issues

**Development Server Won't Start:**
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Check Node.js version (requires 20+)
node --version
```

**Type Errors:**
```bash
# Regenerate React Router types
npm run typecheck

# Clear TypeScript cache
rm -rf .react-router/types
npm run typecheck
```

**Build Failures:**
```bash
# Clear build directory
rm -rf build

# Rebuild
npm run build
```

**Test Failures:**
```bash
# Clear test cache
npm run test:run -- --clearCache

# Run specific test file
npm run test -- animals.service.test.ts
```

**Linting Errors:**
```bash
# Auto-fix issues
npm run lint:fix

# Check specific file
npx eslint app/services/animals.service.ts
```

**Docker Issues:**
```bash
# Rebuild Docker image
docker build --no-cache -t boinanuvem-frontend .

# Check Docker logs
docker logs <container-id>
```

### Performance Issues

**Slow Development Server:**
- Check for large files in `node_modules`
- Clear Vite cache: `rm -rf node_modules/.vite`
- Restart development server

**Large Bundle Size:**
- Analyze bundle: `npm run build -- --analyze`
- Check for unnecessary dependencies
- Use dynamic imports for large components

### Browser Compatibility

**Supported Browsers:**
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

**Issues with Older Browsers:**
- Check browser console for errors
- Verify polyfills are included
- Test in target browser versions

## Contributing

### Getting Started

1. Fork the repository
2. Clone your fork
3. Create a feature branch
4. Make your changes
5. Write tests
6. Ensure all tests pass
7. Submit a pull request

### Code Style Requirements

- Follow ESLint configuration
- Use Prettier for formatting
- Write self-documenting code
- Add comments for complex logic
- Follow existing code patterns

### Testing Requirements

- Write tests for new features
- Maintain or improve test coverage
- Test edge cases and error scenarios
- Ensure tests are fast and reliable

### Documentation Requirements

- Update README for significant changes
- Document new features and APIs
- Add JSDoc comments for public functions
- Update type definitions

### Pull Request Template

When submitting a PR, include:
- Description of changes
- Related issue numbers
- Testing performed
- Screenshots (if UI changes)
- Breaking changes (if any)

## Support

### Contact Information

- **Website**: [https://www.boinanuvem.com.br/](https://www.boinanuvem.com.br/)
- **Email**: contato@boinanuvem.com.br
- **Phone**: +55-11-9999-9999

### Getting Help

- Check this README for common issues
- Review existing issues on the repository
- Contact support through the website
- Submit bug reports with detailed information

### Reporting Bugs

When reporting bugs, include:
- Steps to reproduce
- Expected behavior
- Actual behavior
- Browser and OS information
- Console errors (if any)
- Screenshots (if applicable)

---

**Developed with ❤️ for the Brazilian agribusiness industry**
