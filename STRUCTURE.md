# CẤU TRÚC DỰ ÁN KATOSTORE

## Kiến trúc tổng thể

```
KatoStore/
├── client/          # Frontend (React + Vite)
├── server/          # Backend (Node.js + Express)
└── README.md
```

## Frontend (client/)

### Cấu trúc thư mục

```
client/
├── src/
│   ├── api/                    # API layer
│   │   ├── client.js          # Centralized API client
│   │   ├── authAPI.js         # Authentication APIs
│   │   ├── productAPI.js      # Product APIs
│   │   ├── orderAPI.js        # Order APIs
│   │   ├── userAPI.js         # User APIs
│   │   └── mediaAPI.js        # Media APIs
│   ├── components/            # Reusable components
│   │   ├── AdminSidebar.jsx   # Admin navigation
│   │   ├── AdminLayout.jsx    # Layout wrapper for admin
│   │   ├── Spinner.jsx        # Loading component
│   │   ├── Pagination.jsx     # Pagination component
│   │   ├── Modal.jsx          # Modal component
│   │   ├── Header.jsx         # Site header
│   │   ├── Footer.jsx         # Site footer
│   │   └── Layout.jsx         # Main layout
│   ├── hooks/                 # Custom hooks
│   │   ├── useAuth.jsx        # Authentication management
│   │   └── useApi.js          # API calls helper
│   ├── pages/                 # Page components
│   │   ├── Admin/             # Admin pages
│   │   │   ├── Dashboard.jsx  # Admin dashboard
│   │   │   ├── Products.jsx    # Product management
│   │   │   ├── Orders.jsx     # Order management
│   │   │   ├── Users.jsx      # User management
│   │   │   └── ProductForm.jsx # Product form
│   │   ├── Auth.jsx           # Authentication page
│   │   ├── Home.jsx           # Home page
│   │   ├── Shop.jsx           # Shop page
│   │   ├── Cart.jsx           # Shopping cart
│   │   ├── Checkout.jsx       # Checkout page
│   │   ├── Profile.jsx        # User profile
│   │   └── ProductDetail.jsx  # Product detail
│   ├── routes/                # Routing
│   │   └── AppRoutes.jsx      # Main routing
│   ├── utils/                 # Utility functions
│   │   ├── helpers.js         # Helper functions
│   │   ├── constants.js       # Constants
│   │   ├── errorHandler.js    # Error handling
│   │   └── cart.js            # Cart utilities
│   ├── data/                  # Static data
│   │   └── products.json      # Product data
│   ├── assets/                # Static assets
│   ├── App.jsx                # Main app component
│   ├── App.css                # App styles
│   ├── index.css              # Global styles
│   └── main.jsx               # Entry point
├── public/                    # Public assets
│   ├── images/                # Product images
│   │   ├── Boots/            # Boot images
│   │   ├── Outerwear/        # Outerwear images
│   │   ├── Pants/            # Pants images
│   │   ├── Sandals/          # Sandal images
│   │   ├── Shoes/            # Shoe images
│   │   ├── Skirts/           # Skirt images
│   │   ├── Slides/           # Slide images
│   │   └── Tops/             # Top images
│   └── vite.svg              # Vite logo
├── package.json               # Dependencies
├── vite.config.js            # Vite configuration
└── eslint.config.js          # ESLint configuration
```

## ⚙️ Backend (server/)

### Cấu trúc thư mục

```
server/
├── src/
│   ├── models/                # Database models
│   │   ├── User.js           # User model
│   │   ├── Product.js        # Product model
│   │   └── Order.js          # Order model
│   ├── controllers/           # Business logic
│   │   ├── auth.controller.js    # Authentication logic
│   │   ├── product.controller.js # Product logic
│   │   ├── order.controller.js   # Order logic
│   │   ├── user.controller.js    # User logic
│   │   ├── admin.controller.js   # Admin logic
│   │   └── media.controller.js   # Media logic
│   ├── routes/                # API routes
│   │   ├── auth.routes.js     # Auth routes
│   │   ├── product.routes.js  # Product routes
│   │   ├── order.routes.js    # Order routes
│   │   ├── user.routes.js     # User routes
│   │   ├── admin.routes.js    # Admin routes
│   │   └── media.routes.js    # Media routes
│   ├── middlewares/           # Middleware functions
│   │   ├── auth.js            # Authentication middleware
│   │   ├── roles.js           # Role-based access control
│   │   ├── upload.js          # File upload middleware
│   │   └── errorHandler.js    # Error handling middleware
│   ├── config/                # Configuration
│   │   └── cloudinary.js      # Cloudinary config
│   └── app.js                 # Express app setup
├── scripts/                   # Utility scripts
│   └── importProducts.js     # Product import script
├── index.js                   # Server entry point
├── package.json               # Dependencies
└── .env.example              # Environment variables example
```

## Tech Stack

### Frontend

- **React 18** - UI library
- **Vite** - Build tool
- **TailwindCSS** - Styling
- **React Router** - Routing
- **Axios** - HTTP client
- **React Toastify** - Notifications

### Backend

- **Node.js** - Runtime
- **Express** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM
- **JWT** - Authentication
- **Bcrypt** - Password hashing
- **Cloudinary** - Image storage

## User Roles & Permissions

### Role Hierarchy

```
admin
├── Full system access
├── User management
├── Product management
├── Order management
└── Analytics & reports

manager
├── Product management
├── Order management
├── Analytics & reports
└── No user management

customer
├── Browse products
├── Place orders
├── Manage profile
└── View order history
```

## Key Features

### E-commerce Features

- **Product Catalog** - Browse & search products
- **Shopping Cart** - Add/remove items
- **Checkout Process** - Order placement
- **Order Management** - Track orders
- **User Profiles** - Account management

### Admin Features

- **Dashboard** - System overview
- **Product Management** - CRUD operations
- **Order Management** - Process orders
- **User Management** - Manage users
- **Analytics** - Sales reports

### Technical Features

- **Responsive Design** - Mobile-first
- **Role-based Access** - RBAC system
- **API Integration** - RESTful APIs
- **Error Handling** - Global error management
- **Loading States** - User feedback
- **Form Validation** - Input validation

## Development Workflow

### Code Organization

- **Components** - Reusable UI components
- **Hooks** - Custom React hooks
- **Utils** - Helper functions
- **API** - Centralized API calls
- **Routes** - Page routing

### Styling Approach

- **TailwindCSS** - Utility-first CSS
- **Component-based** - Modular styling
- **Responsive** - Mobile-first design
- **Theme** - Consistent color scheme

### State Management

- **React Context** - Global state
- **Local State** - Component state
- **Custom Hooks** - State logic
- **API State** - Server state

## Responsive Breakpoints

```css
/* Mobile First */
sm: 640px   /* Small devices */
md: 768px   /* Medium devices */
lg: 1024px  /* Large devices */
xl: 1280px  /* Extra large devices */
2xl: 1536px /* 2X large devices */
```

## Environment Variables

### Frontend (.env)

```
VITE_API_URL=http://localhost:5000/api
VITE_CLOUDINARY_CLOUD_NAME=your_cloud_name
VITE_CLOUDINARY_API_KEY=your_api_key
```

### Backend (.env)

```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/katostore
JWT_SECRET=your_jwt_secret
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

## Documentation

- **API Documentation** - RESTful API endpoints
- **Component Library** - Reusable components
- **Database Schema** - Data models
- **Deployment Guide** - Production setup
- **Contributing Guide** - Development guidelines

---

_Last updated: [Current Date]_
_Version: 1.0.0_
