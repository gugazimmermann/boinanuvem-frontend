# Boi na Nuvem - Frontend

A modern, full-stack React application built with React Router v7, featuring a comprehensive dashboard for livestock management, team collaboration, and property management. This application provides a complete solution for managing cattle operations, from animal tracking to financial management and reproductive analytics.

## 🚀 Features

### Core Features
- **Modern Stack**: Built with React Router v7, React 19, TypeScript, and Vite
- **Server-Side Rendering (SSR)**: Optimized for performance and SEO
- **Multi-Language Support**: Internationalization (i18n) with support for Portuguese (pt), English (en), and Spanish (es)
- **Theme Support**: Dark and light mode with system preference detection
- **Responsive Design**: Mobile-first design with Tailwind CSS v4
- **Type Safety**: Full TypeScript support with strict mode

### Livestock Management
- **Animal Management**: Complete animal registration, editing, and tracking with comprehensive filtering and search
  - Detailed animal profiles with breed, gender, birth information, and parent relationships
  - Animal code management and identification
  - Full CRUD operations with view, edit, and delete capabilities
- **Inventory Management**: Comprehensive inventory tracking and management system
  - Complete inventory item registration with categories, units, and minimum stock levels
  - Stock level tracking with automatic calculation based on movements
  - Inventory movements (purchase, sale, adjustment, consumption) with supplier association
  - Low stock alerts and expiration date tracking
  - **Financial Integration**: When adding new inventory items with suppliers, automatically create cash flow transactions and/or accounts payable
    - Cash flow transaction creation with payment method and bank account selection
    - Accounts payable creation with due date, payment method, and bank account
    - Seamless integration between inventory purchases and financial records
- **Birth Records**: Track and manage animal births with parent relationships
  - Automatic purity calculation (PO, F1, F2, F3, F4, F5, PC) based on parent breeds
  - Birth date tracking and gender recording
  - Parent-child relationship management
- **Acquisitions**: Record and manage animal acquisitions with pricing and supplier information
  - Purchase price tracking
  - Supplier relationship management
  - Acquisition date and details recording
- **Weighings**: 
  - Track animal weight measurements over time with trend analysis
  - **Session Weighings**: Register multiple weighings in a single session without page navigation
  - **Session Tracking**: View all weighings registered in the current session with a comprehensive modal
  - **Weight Analysis**: Automatic calculation of weight difference, last weight, and GMD (Daily Average Gain) for each weighing
  - **Efficient Data Entry**: Form preserves employee and service provider selections between registrations for faster data entry
  - **Large Dataset Support**: Paginated table with search and sorting capabilities to handle 500+ weighings efficiently
- **Animal Movements**: Track animal movements between properties and locations with responsible parties, observations, and file attachments
  - Movement type tracking (entry, exit, transfer)
  - Responsible party assignment
  - File attachment support for movement documentation
- **Location Movements**: Monitor location-based movements and activities
  - Track activities and changes at specific locations
  - Movement type categorization
- **Animal Observations**: Record detailed observations for individual animals with file attachments
  - Rich text observations
  - File attachment support
  - Observation history tracking

### Breeding Management
- **Breeding Records**: Register and manage breeding records with multiple methods
  - Natural breeding and artificial insemination tracking
  - Bull and inseminator assignment
  - Breeding date and confirmation status
- **Unconfirmed Breedings**: View and manage unconfirmed breeding records
  - Confirmation workflow
  - Discard functionality for invalid records
- **Pregnant Cows**: Track and monitor pregnant animals
  - Pregnancy status management
  - Expected birth date calculation
- **Reproductive Indexes**: Comprehensive reproductive performance analytics
  - **Fertility Rate**: Percentage of pregnant cows relative to exposed cows
  - **Birth Rate**: Percentage of calves born relative to pregnant females
  - **Calving Interval**: Average time between consecutive calvings
  - **Culling Rate**: Percentage of replaced females relative to total
  - **Intrauterine Mortality Index**: Percentage of gestation losses
  - **Bull-to-Cow Ratio**: Relationship between number of bulls and exposed cows
  - Monthly and annual trend charts
  - Property-level and aggregated company-wide analysis
- **Birth Forecast**: Predict expected births based on confirmed breedings
  - Monthly birth forecasts up to 9 months ahead
  - Visual charts showing expected births by month
  - Property and company-level forecasting

### Property & Location Management
- **Properties**: Manage multiple properties with detailed information
  - Property registration with address and geolocation
  - Interactive maps with Leaflet integration
  - Property-specific analytics and reports
- **Locations**: Track specific locations within properties
  - Location types (pasture, corral, barn, etc.)
  - Area tracking and management
  - Location-specific observations
- **Interactive Maps**: Visual property and location mapping with Leaflet
  - Geocoding integration for address-to-coordinates conversion
  - Map visualization for properties and locations
- **Location Observations**: Record observations for locations
  - Location-specific notes and documentation
  - File attachment support
- **Pasture Planning**: Visual planning tools for pasture management
  - Pasture allocation and planning
  - Breeding season planning based on climate data
  - Forage quality classification based on temperature and precipitation

### People & Business Management
- **Employees**: Manage employee records and information with observation tracking
  - Employee registration and profile management
  - Observation history
  - Role and responsibility tracking
- **Service Providers**: Track service provider relationships and observations
  - Service provider registration
  - Service history tracking
  - Observation and note management
- **Suppliers**: Manage supplier information and relationships with observation records
  - Supplier registration with CNPJ lookup
  - Purchase history tracking
  - Observation management
- **Buyers**: Track buyer information and transactions with observation history
  - Buyer registration
  - Transaction history
  - Observation tracking
- **Observations**: Comprehensive observation system for locations, employees, service providers, suppliers, buyers, animals, and financial entities
  - Rich text observations
  - File attachment support
  - Date and author tracking
  - Multiple observations per entity with full CRUD operations
  - Initial observations when creating new records (for financial entities)

### User & Team Management
- **Authentication**: Complete authentication flow (login, register, password recovery)
  - Secure login system
  - User registration
  - Password recovery and reset functionality
- **Team Management**: User management with permissions and role-based access
  - Add, edit, and remove team members
  - User role assignment
  - Team member profile management
  - Row-click navigation to user details
- **Profile Management**: User and company profile management with activity logs
  - User profile editing
  - Company profile management
  - Activity log tracking
  - User-specific permissions viewing and editing (for main user)
- **Permissions System**: Comprehensive granular permission management for team members
  - **Main User**: Special administrative user with full system access
    - **Automatic Full Permissions**: Main users automatically have all permissions granted (bypasses permission checks)
    - **Permission Management**: Only main users can view and edit permissions for other team members
    - **Activity Logs Access**: Main users have exclusive access to view activity logs for all users
    - **Company Ownership**: Typically the company owner or primary administrator
    - **Unrestricted Access**: Can access all features and data regardless of permission settings
  - **Regular Users**: Team members with specific permission assignments
    - **Granular Permissions**: Each user has specific permissions assigned by the main user
    - **Permission-Based Access**: Access to features is controlled by assigned permissions
    - **View-Only Permissions**: Can view their own permissions but cannot modify them
  - **Section-based organization**: Permissions organized into logical sections
    - **Registration**: Property, Location, Employee, Service Provider, Supplier, Buyer, Animals
    - **Records**: Births, Acquisitions, Weighings
    - **Breedings**: Breedings, Unconfirmed Breedings, Pregnant Cows, Reproductive Indexes, Birth Forecast
    - **Finances**: Cash Flow, Accounts Payable, Accounts Receivable, Bank Accounts
  - **Action-level access control**: Four permission actions per resource
    - **View**: Read-only access to view data
    - **Add**: Create new records
    - **Edit**: Modify existing records
    - **Remove**: Delete records
  - **Permission assignment interface**: Intuitive UI for managing user permissions
    - Section and resource grouping
    - Bulk selection (select all) per resource
    - Visual permission indicators
    - **Editable by main user only** - Regular users cannot modify permissions
  - **Permission visibility**: View permissions on user profile pages
    - Main users can view and edit all user permissions
    - Regular users can view their own permissions (read-only)
  - **Default permissions**: Configurable default permission sets for new users
    - New users start with no permissions by default
    - Main user assigns appropriate permissions during user creation or later

### Financial Management
- **Financial Dashboard**: Comprehensive overview with income, expenses, and cash flow metrics
  - Income vs expenses visualization
  - Monthly cash flow charts
  - Payment status overview
  - Key financial metrics at a glance
- **Cash Flow Management**: Track income and expenses with detailed categorization
  - Income and expense recording
  - Category-based organization
  - Payment method tracking
  - Date and description management
  - **Observations System**: Add multiple observations with file attachments to each transaction
    - Initial observation when creating new transactions
    - Multiple observations on transaction detail pages
    - File attachment support (photos, documents)
    - Complete observation history tracking
- **Accounts Payable**: Manage bills and payments with due date tracking and status monitoring
  - Bill registration with due dates
  - Payment status tracking (pending, paid, overdue)
  - Payment date recording
  - Supplier relationship linking
  - **Observations System**: Add multiple observations with file attachments to each account
    - Initial observation when creating new accounts
    - Multiple observations on account detail pages
    - File attachment support (photos, documents)
    - Complete observation history tracking
- **Accounts Receivable**: Track receivables with payment status and overdue management
  - Receivable registration
  - Payment status tracking
  - Buyer relationship linking
  - Overdue identification
  - **Observations System**: Add multiple observations with file attachments to each account
    - Initial observation when creating new accounts
    - Multiple observations on account detail pages
    - File attachment support (photos, documents)
    - Complete observation history tracking
- **Bank Accounts**: Manage multiple bank accounts with balance tracking
  - Bank account registration
  - Account type management (checking, savings, etc.)
  - Balance tracking
  - Account details management
- **Financial Analytics**: Visual charts and graphs for income vs expenses, monthly cash flow, and payment status
  - Recharts integration for data visualization
  - Interactive charts and graphs
  - Period-based filtering
- **Transaction Management**: Complete CRUD operations for all financial transactions
  - Create, read, update, and delete operations
  - Transaction history
  - Detailed transaction views

### Dashboard & Analytics
- **Comprehensive Dashboard**: Overview with key metrics and statistics
  - Quick access to main features
  - Key performance indicators
  - Recent activity summary
- **Data Visualization**: Charts and graphs using Recharts
  - Line charts for trends
  - Bar charts for comparisons
  - Responsive chart containers
- **Activity Logs**: Track user and system activities
  - User action logging
  - System event tracking
  - Activity history viewing
- **Help Center**: Comprehensive FAQ and help documentation
  - **41+ FAQs** covering all major features and workflows
  - **9 Categories**: Getting Started, Animals, Locations, Relationships, Records, Financial, Analytics, Team, and Technical
  - **Quick Start Guide**: Step-by-step instructions for new users
  - **Contact Support**: Support channels and contact information
  - **Category Filtering**: Filter FAQs by category for easy navigation
  - **Fully Internationalized**: All help content available in Portuguese, English, and Spanish
  - **Comprehensive Coverage**: FAQs for animal management, locations, employees, service providers, suppliers, buyers, observations, weighings (including session weighings), acquisitions, movements, inventory management (including financial integration), financial management (including observations for cash flow, accounts payable, and accounts receivable), reproductive indexes, birth forecast, dashboard metrics, pasture planning, breeding season, search & filtering, data organization, and best practices

## 📋 Prerequisites

- **Node.js** 20 or higher
- **npm** (comes with Node.js) or **yarn** or **pnpm**

## 🚀 Quick Start

1. **Clone the repository:**
```bash
git clone <repository-url>
cd boinanuvem-frontend
```

2. **Install dependencies:**
```bash
npm install
```

3. **Start the development server:**
```bash
npm run dev
```

The application will be available at `http://localhost:5173` with Hot Module Replacement (HMR) enabled.

## 🛠️ Installation

For detailed installation instructions, follow the Quick Start guide above. The project uses npm by default, but you can use yarn or pnpm as well.

## 🏃 Development

### Development Server

Start the development server with Hot Module Replacement (HMR):

```bash
npm run dev
```

The application will be available at `http://localhost:5173`.

### Development Features

- **Hot Module Replacement (HMR)**: Instant updates without page refresh
- **TypeScript**: Full type checking and IntelliSense support
- **ESLint**: Real-time code quality checks
- **Fast Refresh**: React component state preservation during development

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
- `npm run test:run` - Run tests once (CI mode)
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
│   │   ├── __tests__/     # i18n translation tests
│   │   └── translations/   # Translation files (pt, en, es)
│   ├── mocks/              # Mock data for development
│   │   └── __tests__/     # Mock data function tests
│   ├── routes/             # Route components
│   │   ├── dashboard/      # Dashboard route components
│   │   │   └── __tests__/ # Route component tests
│   │   └── *.tsx          # Public routes (home, login, register, etc.)
│   ├── services/           # Service layer (data access and business logic)
│   │   ├── __tests__/     # Service tests
│   │   └── *.service.ts   # Service files for each entity
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

### Service Layer Architecture

The application uses a service layer pattern to abstract data access and business logic. All services follow a consistent pattern with CRUD operations and data filtering capabilities:

- **Core Entity Services**: 
  - `animals.service.ts` - Animal management and queries
  - `users.service.ts` - User and authentication management
  - `companies.service.ts` - Company profile management
  - `properties.service.ts` - Property management and queries
  - `locations.service.ts` - Location management within properties
  - `employees.service.ts` - Employee management
  - `suppliers.service.ts` - Supplier management
  - `buyers.service.ts` - Buyer management
  - `service-providers.service.ts` - Service provider management

- **Record Services**: 
  - `births.service.ts` - Birth record management with purity calculation
  - `weighings.service.ts` - Weight measurement tracking
  - `acquisitions.service.ts` - Animal acquisition records
  - `breedings.service.ts` - Breeding record management

- **Movement Services**: 
  - `animal-movements.service.ts` - Animal movement tracking between properties/locations
  - `location-movements.service.ts` - Location-based movement tracking

- **Observation Services**: 
  - `animal-observations.service.ts` - Animal observation management
  - `location-observations.service.ts` - Location observation management
  - `employee-observations.service.ts` - Employee observation management
  - `service-provider-observations.service.ts` - Service provider observation management
  - `supplier-observations.service.ts` - Supplier observation management
  - `buyer-observations.service.ts` - Buyer observation management
  - `cash-flow-observations.service.ts` - Cash flow transaction observation management
  - `accounts-payable-observations.service.ts` - Accounts payable observation management
  - `accounts-receivable-observations.service.ts` - Accounts receivable observation management

- **Financial Services**: 
  - `cash-flow.service.ts` - Income and expense tracking
  - `accounts-payable.service.ts` - Bills and payments management
  - `accounts-receivable.service.ts` - Receivables management
  - `bank-account.service.ts` - Bank account management

- **Analytics Services**: 
  - `reproductive-indexes.service.ts` - Reproductive performance calculations
    - Fertility rate, birth rate, calving interval
    - Culling rate, intrauterine mortality index
    - Bull-to-cow ratio
    - Expected births forecast

All services are exported through `app/services/index.ts` for centralized access. Services use mock data for development and can be easily replaced with API calls in production.

### Mock Data System

The application includes a comprehensive mock data system for development and testing:

- **Mock Data Files**: Located in `app/mocks/` directory
  - `animals.ts` - Animal mock data with relationships
  - `births.ts` - Birth records with parent relationships
  - `breedings.ts` - Breeding records with confirmation status
  - `weighings.ts` - Weight measurement records
  - `acquisitions.ts` - Acquisition records
  - `companies.ts` - Company profiles
  - `properties.ts` - Property data with locations
  - `locations.ts` - Location data within properties
  - `employees.ts` - Employee records
  - `suppliers.ts` - Supplier information
  - `buyers.ts` - Buyer information
  - `service-providers.ts` - Service provider records
  - `users.ts` - User accounts and authentication
  - `animal-movements.ts` - Animal movement records
  - `location-movements.ts` - Location movement records
  - `animal-observations.ts` - Animal observation records
  - `location-observations.ts` - Location observation records
  - `employee-observations.ts` - Employee observation records
  - `service-provider-observations.ts` - Service provider observation records
  - `supplier-observations.ts` - Supplier observation records
  - `buyer-observations.ts` - Buyer observation records
  - `cash-flow-observations.ts` - Cash flow transaction observation records
  - `accounts-payable-observations.ts` - Accounts payable observation records
  - `accounts-receivable-observations.ts` - Accounts receivable observation records
  - `cash-flow.ts` - Cash flow transactions
  - `accounts-payable.ts` - Accounts payable records
  - `accounts-receivable.ts` - Accounts receivable records
  - `bank-accounts.ts` - Bank account records

- **Mock Data Features**:
  - Realistic data relationships (parent-child, property-location, etc.)
  - Comprehensive test coverage for mock data functions
  - Type-safe mock data generation
  - Consistent data structure across all entities

## 🌐 Internationalization

The application supports multiple languages with full internationalization (i18n) support:
- **Portuguese (pt)** - Default language
- **English (en)** - Full translation coverage
- **Spanish (es)** - Full translation coverage

### Translation System

Language files are located in `app/i18n/translations/`. The language context provides translation hooks throughout the application using the `useTranslation` hook.

### Translation Coverage

All user-facing strings are internationalized, including:
- **Navigation**: Menu items, breadcrumbs, page titles
- **Forms**: Labels, placeholders, validation messages
- **Tables**: Headers, filters, pagination controls
- **Actions**: Button labels, tooltips, confirmations
- **Notifications**: Success, error, and info messages
- **Data**: Animal movement types, breeding methods, financial categories
- **Analytics**: Chart labels, metric names, date formats

### Using Translations

```typescript
import { useTranslation } from "~/i18n/use-translation";

function MyComponent() {
  const { t } = useTranslation();
  
  return <h1>{t.animals.title}</h1>;
}
```

The application uses a comprehensive translation system with:
- **Type-safe translation keys** - Full TypeScript support
- **Fallback support** - Defaults to Portuguese if translation is missing
- **Locale-aware formatting** - Dates and numbers formatted according to locale
- **Dynamic language switching** - Change language without page reload

## 🎨 Theming

The application supports both **light** and **dark** themes with comprehensive theme management:

### Theme Features

- **Automatic System Detection**: Detects and applies system theme preference on first visit
- **Manual Theme Switching**: Users can manually toggle between light and dark themes
- **Persistent Preferences**: Theme selection is saved in localStorage and persists across sessions
- **Smooth Transitions**: Theme changes apply smoothly without page reload
- **Consistent Styling**: All components respect the selected theme using Tailwind CSS dark mode

### Theme Implementation

The theme is managed through React Context (`ThemeContext`) and uses Tailwind CSS's dark mode classes. Theme preferences are automatically synced across all components.

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

The Dockerfile uses a multi-stage build process to optimize image size and build time:
1. **development-dependencies-env**: Installs all dependencies (including dev dependencies)
2. **production-dependencies-env**: Installs production dependencies only
3. **build-env**: Builds the application for production
4. **Final stage**: Creates minimal production image with only runtime dependencies

This approach results in a smaller final image (~200MB) while maintaining all necessary functionality.

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

### Docker Deployment

The application includes a Dockerfile for containerized deployment. The Dockerfile uses a multi-stage build process to optimize the final image size:

1. **development-dependencies-env**: Installs all dependencies (including dev dependencies)
2. **production-dependencies-env**: Installs production dependencies only
3. **build-env**: Builds the application for production
4. **Final stage**: Creates minimal production image with only necessary files

This approach results in a smaller final image while maintaining all necessary functionality.

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

The project maintains comprehensive test coverage covering:
- **Components**: UI components, dashboard components, and site components
- **Hooks**: Custom React hooks (CEP lookup, CNPJ lookup, auto-rotate, smooth scroll)
- **Contexts**: Theme and language contexts
- **Services**: Service layer functions for data access and business logic
- **Utilities**: Helper functions and utilities
- **Types**: Type definitions and validations
- **i18n**: Translation keys and internationalization
- **Mocks**: Mock data functions and data management
- **Routes**: Route components and navigation, including comprehensive coverage for:
  - Dashboard routes (movements, observations, properties, animals, finances, etc.)
  - Authentication flows (login, register, password recovery)
  - Public site routes

Coverage reports are generated in the `coverage/` directory and can be viewed by opening `coverage/index.html` in a browser. The project continuously improves test coverage with focus on edge cases, user interactions, and navigation flows.

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

### Test Code Standards

- Test files follow clean code principles with descriptive test names
- All test files are comment-free to maintain clarity and focus on test behavior
- Tests are self-documenting through clear naming conventions and structure
- Comprehensive coverage of edge cases, error handling, and user interactions
- Proper use of `act()` for state updates in React component tests
- Mock services and hooks to isolate component behavior

### Recent Test Improvements

- **Comprehensive Inventory Test Coverage**: Added complete test suites for inventory routes, services, and mocks
  - Inventory list page tests (rendering, search, filters, pagination, sorting, deletion)
  - New inventory item form tests (form submission, validation, financial integration)
  - Edit inventory item form tests (data pre-population, form submission, validation)
  - Inventory item details page tests (data display, stock status, expiration tracking)
  - Inventory movement form tests (movement types, validation, financial options)
  - Service layer tests (CRUD operations, stock calculation, filtering)
  - Mock data structure validation tests
- **Alert Component Migration**: Replaced all vanilla `alert()` calls with the custom Alert component
  - Updated user profile, company profile, and registration components
  - Updated all related tests to check for Alert component rendering instead of `global.alert` calls
  - Consistent UI experience with styled alerts, animations, and auto-dismiss functionality

## 🔐 Permissions & Access Control

### Main User vs Regular Users

The application implements a two-tier user system with distinct permission models:

#### Main User

The **main user** is a special administrative account that serves as the company owner or primary administrator:

- **Full System Access**: Automatically bypasses all permission checks and has unrestricted access to all features
- **Permission Management**: Exclusive right to view and edit permissions for all team members
- **Activity Logs**: Can view activity logs for all users in the company
- **Company Administration**: Typically the first user created for a company or designated as the main user
- **No Permission Restrictions**: All routes, features, and data are accessible regardless of permission settings

**Technical Implementation:**
- Identified by `mainUser: true` property on the user object
- Permission checks automatically return `true` for main users
- Uses `usePermissions()` hook which returns `isMainUser()` helper function

#### Regular Users

**Regular users** are team members with specific, granular permissions:

- **Assigned Permissions**: Each user has a specific set of permissions assigned by the main user
- **Permission-Based Access**: Access to features is strictly controlled by assigned permissions
- **View-Only Permissions**: Can view their own permissions but cannot modify them
- **Restricted Access**: Can only access features and data for which they have explicit permissions

**Permission Structure:**
- Permissions are organized into sections (Registration, Records, Breedings, Finances)
- Each resource has four actions: View, Add, Edit, Remove
- Permissions are stored per user and checked on every route and action

### Permission System Architecture

The permissions system uses a hierarchical structure:

```
UserPermissions
├── registration/
│   ├── property (view, add, edit, remove)
│   ├── location (view, add, edit, remove)
│   ├── employee (view, add, edit, remove)
│   ├── serviceProvider (view, add, edit, remove)
│   ├── supplier (view, add, edit, remove)
│   ├── buyer (view, add, edit, remove)
│   └── animals (view, add, edit, remove)
├── records/
│   ├── births (view, add, edit, remove)
│   ├── acquisitions (view, add, edit, remove)
│   └── weighings (view, add, edit, remove)
├── breedings/
│   ├── breedings (view, add, edit, remove)
│   ├── unconfirmedBreedings (view, add, edit, remove)
│   ├── pregnantCows (view, add, edit, remove)
│   ├── reproductiveIndexes (view, add, edit, remove)
│   └── birthForecast (view, add, edit, remove)
└── finances/
    ├── cashFlow (view, add, edit, remove)
    ├── accountsPayable (view, add, edit, remove)
    ├── accountsReceivable (view, add, edit, remove)
    └── bankAccounts (view, add, edit, remove)
```

### Using Permissions in Code

The application provides a `usePermissions()` hook for checking permissions:

```typescript
import { usePermissions } from "~/utils/permissions";

function MyComponent() {
  const { canView, canAdd, canEdit, canRemove, isMainUser } = usePermissions();
  
  // Check specific permissions
  if (canView("registration", "animals")) {
    // Show animals list
  }
  
  // Check if user is main user
  if (isMainUser()) {
    // Show admin-only features
  }
  
  // Check multiple permissions
  const canManageAnimals = canAdd("registration", "animals") && 
                           canEdit("registration", "animals");
}
```

### Route Protection

Routes are protected using route guards that check permissions:

```typescript
// Require specific permission
export const loader = createRouteGuard(
  "registration.animals",
  "view"
);

// Require main user
export const loader = requireMainUser();
```

### Permission Assignment Workflow

1. **User Creation**: Main user creates a new team member
2. **Default Permissions**: New user starts with no permissions (all false)
3. **Permission Assignment**: Main user assigns appropriate permissions via the user profile page
4. **Permission Updates**: Main user can modify permissions at any time
5. **Permission Validation**: System validates permissions on every action and route access

## 🧪 Code Quality

### Pre-commit Hooks

This project uses **Husky** to run pre-commit checks. Before each commit, the following checks are automatically executed:
- **TypeScript type checking** - Ensures type safety
- **ESLint code quality checks** - Validates code style and best practices
- **Prettier code formatting validation** - Ensures consistent code formatting
- **Test suite execution** - Runs all tests to prevent regressions

This ensures code quality and consistency across the project. All checks must pass before a commit can be completed.

### Git Hooks Setup

Husky is automatically set up when you run `npm install` (via the `prepare` script). If you need to manually set up hooks:

```bash
npm run prepare
```

### Type Checking

Run TypeScript type checking:

```bash
npm run typecheck
```

This command generates React Router types and runs the TypeScript compiler. The project maintains strict TypeScript configuration with full type safety across all components, utilities, services, and mock data functions.

### Type Safety Features

- **Strict Mode**: Full TypeScript strict mode enabled
- **Type Inference**: Comprehensive type inference for better developer experience
- **Generic Components**: Reusable generic components with proper type constraints
- **Mock Data Types**: Fully typed mock data with proper interfaces

### Linting

Check code quality with ESLint:

```bash
npm run lint
```

Automatically fix linting issues:

```bash
npm run lint:fix
```

The project uses ESLint with TypeScript-specific rules, React hooks rules, and accessibility checks. All code follows consistent linting standards with zero warnings in production code.

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
- **React Router v7** (^7.9.2) - Full-stack React framework with SSR support
- **React 19** (^19.1.1) - UI library with latest features
- **TypeScript 5.9** (^5.9.2) - Type safety and developer experience
- **Vite 7** (^7.1.7) - Build tool and dev server

### Key Features
- **Server-Side Rendering (SSR)** - Optimized for SEO and performance
- **Type Safety** - Full TypeScript coverage with strict mode
- **Internationalization** - Multi-language support (pt, en, es)
- **Accessibility** - WCAG compliant components and interactions
- **Responsive Design** - Mobile-first approach with Tailwind CSS

### Styling & UI
- **Tailwind CSS v4** (^4.1.13) - Utility-first CSS framework
- **Custom UI Components** - Reusable component library
- **@tailwindcss/vite** (^4.1.13) - Tailwind CSS Vite plugin

### Data & Visualization
- **Recharts** (^3.4.1) - Chart and graph library for data visualization
  - Line charts for trend analysis
  - Bar charts for comparisons
  - Responsive chart containers
- **Leaflet** (^1.9.4) - Interactive maps for property and location visualization
  - Geocoding integration
  - Map markers and layers
- **date-fns** (^4.1.0) - Date utility library
  - Locale support for pt, en, es
  - Date formatting and manipulation

### Testing
- **Vitest** (^4.0.9) - Fast unit test framework
- **React Testing Library** (^16.3.0) - Component testing utilities
- **@testing-library/jest-dom** (^6.9.1) - Custom DOM matchers
- **@testing-library/user-event** (^14.6.1) - User interaction simulation
- **jsdom** (^27.2.0) - DOM implementation for Node.js testing
- **@vitest/coverage-v8** (^4.0.9) - Code coverage reporting
- **@vitest/ui** (^4.0.9) - Interactive test UI

### Development Tools
- **ESLint** (^9.39.1) - Code linting and quality checks
- **Prettier** (^3.6.2) - Code formatting
- **TypeScript ESLint** (^8.46.4) - TypeScript-specific linting rules
- **Husky** (^9.1.7) - Git hooks for pre-commit checks
- **vite-tsconfig-paths** (^5.1.4) - TypeScript path resolution for Vite

### Runtime
- **Node.js 20** - Runtime environment (Alpine Linux in Docker)
- **@react-router/node** (^7.9.2) - React Router Node.js adapter
- **@react-router/serve** (^7.9.2) - React Router production server
- **isbot** (^5.1.31) - Bot detection for SSR optimization

## 🔧 Troubleshooting

### Common Issues

**Port already in use:**
```bash
# Kill the process using port 5173
lsof -ti:5173 | xargs kill -9
```

**Type errors after installation:**
```bash
# Regenerate React Router types
npm run typecheck
```

**Module not found errors:**
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

**Build failures:**
```bash
# Clear build cache and rebuild
rm -rf build .react-router
npm run build
```

## 📝 License

This project is proprietary software. All rights reserved.

## 👥 Contributing

Contributions are welcome! Please follow these guidelines:

1. **Fork the repository** and create a feature branch
2. **Follow code style** - Run `npm run lint` and `npm run format` before committing
3. **Write tests** - Ensure all new features have test coverage
4. **Update documentation** - Keep the README and code comments up to date
5. **Submit a pull request** - Include a clear description of changes

### Development Workflow

1. Create a new branch from `main`
2. Make your changes
3. Run tests: `npm test`
4. Run type checking: `npm run typecheck`
5. Run linting: `npm run lint`
6. Format code: `npm run format`
7. Commit changes (pre-commit hooks will run automatically)
8. Push and create a pull request

---

Built with ❤️ using React Router and modern web technologies.

