# TechService - Service and Rental Management System

A modern React application for managing service jobs and product rentals, built with Vite, React Router, and Tailwind CSS.

## Features

### Admin Features
- **Post Job**: Create new service job requests with customer details, location, issue, work date, and priority
- **Job History**: View ongoing, recently completed, and historical job records
- **Product Rental**: Manage product rentals with customer info, device serial numbers, rental periods, and security deposits
- **Rental History**: Track ongoing and completed rentals
- **Available Devices**: View device inventory with serial numbers, models, and availability status
- **Admin Settings**: Add new administrators with username, email, and password

### Employee Features
- **Available Jobs**: Browse and accept available service jobs with filtering and search
- **On-going Job**: View and manage current assignments with "Finished" button
- **Submit Report**: Complete job reports with work description, equipment used, time taken, and completion photos
- **Recently Completed Job**: View recently finished jobs with customer and work details

## Tech Stack

- **React 18** - UI library
- **Vite** - Build tool and dev server
- **React Router DOM** - Client-side routing
- **Tailwind CSS** - Utility-first CSS framework
- **PostCSS & Autoprefixer** - CSS processing

## Project Structure

```
src/
├── components/
│   ├── admin/
│   │   ├── PostJob.jsx
│   │   ├── JobHistory.jsx
│   │   ├── RentalProduct.jsx
│   │   ├── RentalHistory.jsx
│   │   ├── AvailableDevices.jsx
│   │   └── AdminSettings.jsx
│   ├── employee/
│   │   ├── AvailableJobs.jsx
│   │   ├── OngoingJob.jsx
│   │   ├── SubmitReport.jsx
│   │   └── RecentlyCompleted.jsx
│   └── Sidebar.jsx
├── pages/
│   ├── Login.jsx
│   ├── AdminDashboard.jsx
│   └── EmployeeDashboard.jsx
├── App.jsx
├── main.jsx
└── index.css
```

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Open your browser and navigate to `http://localhost:5173`

### Build for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

## Demo Credentials

### Admin Login
- **Email**: admin@techservice.com
- **Password**: password

### Staff Login
- **Email**: staff@techservice.com
- **Password**: password

## Design Tokens

The application uses a consistent design system with the following color tokens:

- **Primary Blue**: `#2F7FFB`
- **Text Colors**: 
  - Primary: `#333333`
  - Secondary: `#6C757D`
- **Priority Colors**:
  - High: `#F97316` (Orange)
  - Medium: `#F59E0B` (Amber)
  - Low: `#10B981` (Green)
- **Status Colors**:
  - Open: `#2F7FFB` (Blue)
  - In Progress: `#8B5CF6` (Purple)
  - Completed: `#10B981` (Green)

## Responsive Design

The application is fully responsive with breakpoints for:
- **Mobile**: < 768px
- **Tablet**: 768px - 1024px
- **Desktop**: > 1024px

## Features Implemented

✅ Modern React with functional components and hooks
✅ Clean folder structure (components, pages, assets)
✅ CSS Modules / Tailwind CSS styling
✅ Responsive design for all screen sizes
✅ Design tokens for colors and typography
✅ Accessible forms with proper labels
✅ Routing and navigation
✅ Role-based access control (Admin/Employee)
✅ Form validation
✅ Search and filter functionality

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## License

MIT



