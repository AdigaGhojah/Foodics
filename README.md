# Foodics Reservation Management System

A Vue 3 + TypeScript application for managing restaurant branch reservations, built with modern component architecture and reusable UI patterns.

## Project Structure

```
src/
├── components/           # Reusable UI components
│   ├── BaseButton.vue   # Standardized button with variants (primary, secondary, danger)
│   ├── BaseModal.vue    # Reusable modal with header/body/footer slots
│   ├── MultiSelect.vue  # Multi-selection dropdown component
│   ├── TimeSlot.vue     # Time range picker with validation
│   ├── BranchesTable.vue # Data table for branch listings
│   ├── AddBranchModal.vue # Modal for enabling branch reservations
│   └── EditBranchModal.vue # Modal for editing branch settings
├── composables/         # Vue composition functions
│   └── useBranches.ts   # Branch data management and API calls
├── lib/                 # Utility libraries
│   └── api.ts          # HTTP client with authentication
├── types/               # TypeScript type definitions
│   └── branches.ts     # Branch, Section, Table interfaces
├── views/               # Page-level components
│   └── Branches.vue    # Main branches management page
└── router/              # Vue Router configuration
    └── index.ts
```

## Key Implementation Decisions

### 1. Component Architecture

- **Base Components**: `BaseButton` and `BaseModal` provide consistent styling and behavior across the app
- **Composition API**: Used throughout for better type safety and code organization
- **Props/Emits Pattern**: Clear component interfaces with TypeScript validation

### 2. State Management

- **Composables**: `useBranches` centralizes branch data operations and API calls
- **Reactive Forms**: Local form state with validation in modal components
- **Optimistic Updates**: Batch API calls to reduce server load

### 3. Validation Strategy

- **TimeSlot Validation**: Ensures end time ≥ start time and meets minimum duration
- **Form Validation**: Prevents submission with invalid data
- **Visual Feedback**: Invalid slots show red borders and error messages

### 4. API Design

- **RESTful Endpoints**: Standard HTTP methods for CRUD operations
- **Batch Operations**: `Promise.all` for multiple branch updates
- **Error Handling**: Consistent error catching and user feedback

### 5. Styling Approach

- **SCSS Nesting**: Organized styles with proper nesting for maintainability
- **CSS Variables**: Reusable color tokens in BaseButton for consistency
- **Component Scoping**: Scoped styles prevent CSS conflicts

## Features

- **Branch Management**: Enable/disable reservations for restaurant branches
- **Table Selection**: Multi-select tables from branch sections
- **Time Slot Configuration**: Set available reservation times per day
- **Duration Settings**: Configure minimum reservation duration
- **Validation**: Real-time validation for time slots and required fields
- **Bulk Operations**: Disable reservations for all branches at once

## Setup Instructions

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
# Clone the repository (HTTPS)
git clone https://github.com/AdigaGhojah/Foodics.git

# Or clone using SSH
git clone git@github.com:AdigaGhojah/Foodics.git

cd foodics

# Install dependencies
npm install
```

### Environment Configuration

Create a `.env` file in the root directory:

```env
VITE_API_URL=https://your-api-endpoint.com
VITE_API_TOKEN=your-bearer-token
```

### Development

```bash
# Start development server
npm run dev

# Type checking
npm run type-check

# Linting
npm run lint
```

### Production Build

```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

## Usage

### Managing Branches

1. **View Branches**: The main page displays all enabled branches with their table counts
2. **Add Branches**: Click "Add Branches" to enable reservations for disabled branches
3. **Edit Settings**: Click any branch row to configure:
   - Reservation duration (minimum minutes)
   - Available tables (from branch sections)
   - Time slots for each day of the week
4. **Bulk Disable**: Use "Disable Reservations" to disable all branches at once

### Time Slot Configuration

- **Add Slots**: Click "+" to add time slots (max 3 per day)
- **Time Validation**: End time must be after start time and meet minimum duration
- **Copy Settings**: "Apply on all days" copies Saturday slots to other days
- **Visual Feedback**: Invalid slots show red borders and error messages

## API Integration

The app expects a REST API with the following endpoints:

- `GET /branches?include[0]=sections&include[1]=sections.tables` - Fetch branches with sections and tables
- `PUT /branches/{id}` - Update branch settings (accepts_reservations, reservation_duration, etc.)

## Recommended IDE Setup

[VS Code](https://code.visualstudio.com/) + [Vue (Official)](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (disable Vetur).

### Browser Extensions

- **Chrome/Edge**: [Vue.js devtools](https://chromewebstore.google.com/detail/vuejs-devtools/nhdogjmejiglipccpnnnanhbledajbpd)
- **Firefox**: [Vue.js devtools](https://addons.mozilla.org/en-US/firefox/addon/vue-js-devtools/)

## TypeScript Support

This project uses `vue-tsc` for type checking. The TypeScript language service in editors requires [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) to understand `.vue` file types.

## Customization

### Adding New Button Colors

Extend the `color` prop in `BaseButton.vue`:

```typescript
color?: 'primary' | 'secondary' | 'danger' | 'success' | 'warning'
```

### Adding New Modal Sizes

Use the `maxWidth` prop in `BaseModal.vue`:

```vue
<BaseModal max-width="800px">...</BaseModal>
```

### Extending Branch Types

Add new fields to the interfaces in `src/types/branches.ts` and update the API calls in `useBranches.ts`.
