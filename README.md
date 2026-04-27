# 🖋️ Vellum

A high-end, full-stack form creation platform designed for those who value clarity, precision, and a premium user experience. Built with modern aesthetics and micro-interactions, Vellum elevates simple data collection into a creative studio experience.

![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=flat-square)
![React](https://img.shields.io/badge/React-18.3.1-61dafb?style=flat-square)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Latest-336791?style=flat-square)
![License](https://img.shields.io/badge/License-MIT-yellow?style=flat-square)

---

## ✨ Features

### 🎨 Design & Personalization
- **Dynamic Theming**: True Dark/Light mode support across the entire platform, integrated with the global design system
- **User Identity**: Personalized profile avatars with custom color synchronization
- **Premium UI**: Glassmorphism effects, smooth hover-scale transitions, and high-fidelity iconography powered by Lucide React
- **HSL-Based Design System**: Semantic color tokens for consistent, maintainable styling

### 🛠️ Studio Features
- **Template Gallery**: Start instantly with curated templates for Feedback, Events, and Market Research
- **Sophisticated Editor**: Real-time form building with complex question types:
  - Multiple Choice
  - Checkboxes
  - Short Answer
  - Long Answer
  - And more...
- **Access Control**: Securely toggle forms between 'Live' and 'Private' modes for total privacy control
- **Responsive Design**: Seamless experience across desktop, tablet, and mobile devices

### 📊 Intelligence & Management
- **Live Analytics**: Real-time response aggregation visible directly on your studio dashboard
- **Universal Search**: Instantly find your work with a lightning-fast dashboard search engine
- **Studio Toast System**: A refined, internal notification system replacing intrusive browser alerts
- **Export Capabilities**: Download form responses in Excel format for further analysis
- **Real-time Updates**: WebSocket integration for live form response notifications

### 🚀 Technical Highlights
- RESTful API architecture
- JWT-based authentication
- Prisma ORM with PostgreSQL
- Real-time communication with Socket.io
- Redis caching for performance
- Modular architecture with separation of concerns

---

## 🛠️ Tech Stack

### Backend
- **Node.js 18+**
- **Express 5.2.1**
  - RESTful API
  - Middleware architecture
  - Session management
- **PostgreSQL** (Latest)
- **Prisma ORM 5.22.0**
- **JWT 9.0.3** (Authentication)
- **Socket.io 4.8.1** (Real-time)
- **Redis 5.10.0** (Caching)

### Frontend
- **React 18.3.1** (UI Library)
- **Vite 5.0.0** (Build tool)
- **React Router 6.20.0** (Routing)
- **Framer Motion 10.16.4** (Animations)
- **Lucide React 0.292.0** (Icons)
- **Axios 1.6.2** (HTTP Client)

### Tools & Libraries
- **Vercel** (Deployment)
- **Git** (Version control)
- **Nodemon 3.1.11** (Development)
- **Jest 30.2.0** (Testing)
- **BCrypt 6.0.0** (Password encryption)

---

## � Getting Started

### Prerequisites
- Node.js 18 or higher
- PostgreSQL 14 or higher
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yash-kumarsharma/formforge.git
   cd formforge
   ```

2. **Configure Environment Variables**
   
   Create a `.env` file in the `backend/` directory:
   ```env
   # Server Configuration
   PORT=4000
   NODE_ENV=development

   # Database Configuration
   DATABASE_URL="postgresql://username:password@localhost:5432/vellum?schema=public"

   # JWT Configuration
   JWT_SECRET="your_super_secret_jwt_key_here"

   # Redis Configuration (Optional)
   REDIS_URL="redis://localhost:6379"

   # CORS Configuration
   FRONTEND_URL="http://localhost:5173"
   ```

3. **Install dependencies**
   ```bash
   npm run install:all
   ```

4. **Setup database**
   ```bash
   npm run setup
   cd backend
   npx prisma migrate dev --name init
   cd ..
   ```

5. **Run the application**
   ```bash
   npm start
   ```

6. **Access the application**
   
   - Frontend: `http://localhost:5173`
   - Backend API: `http://localhost:4000`

---

## � Project Structure

```
formforge/
├── frontend/                 # React + Vite application
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── pages/           # Page components
│   │   ├── styles/          # Global styles & design system
│   │   ├── utils/           # Helper functions
│   │   └── main.jsx         # Application entry point
│   └── package.json
│
├── backend/                  # Express API server
│   ├── src/
│   │   ├── modules/         # Feature modules
│   │   │   ├── auth/        # Authentication
│   │   │   ├── forms/       # Form management
│   │   │   ├── responses/   # Response handling
│   │   │   └── users/       # User management
│   │   ├── middleware/      # Custom middleware
│   │   ├── config/          # Configuration files
│   │   └── server.js        # Server entry point
│   ├── prisma/
│   │   └── schema.prisma    # Database schema
│   └── package.json
│
├── package.json              # Root package configuration
├── vercel.json               # Vercel deployment config
└── README.md
```

---

## 🔌 API Endpoints

### Authentication
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/auth/register` | Register new user | ❌ |
| POST | `/api/auth/login` | User login | ❌ |
| GET | `/api/auth/me` | Get current user | ✅ |

### Forms
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/forms` | Get all user forms | ✅ |
| GET | `/api/forms/:id` | Get specific form | ✅ |
| POST | `/api/forms` | Create new form | ✅ |
| PUT | `/api/forms/:id` | Update form | ✅ |
| DELETE | `/api/forms/:id` | Delete form | ✅ |
| PATCH | `/api/forms/:id/toggle` | Toggle form status | ✅ |

### Responses
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/responses/:formId` | Get form responses | ✅ |
| POST | `/api/responses/:formId` | Submit response | ❌ |
| GET | `/api/responses/:formId/export` | Export to Excel | ✅ |

### Users
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/users/profile` | Get user profile | ✅ |
| PUT | `/api/users/profile` | Update profile | ✅ |

---

## 📝 Available Scripts

### Root Directory
- `npm run install:all` - Install all dependencies
- `npm run setup` - Generate Prisma client
- `npm start` - Start both frontend and backend
- `npm run dev:backend` - Start backend only
- `npm run dev:frontend` - Start frontend only
- `npm run build` - Build for production

### Backend
- `npm run dev` - Start development server with hot reload
- `npm start` - Start production server
- `npm test` - Run tests

### Frontend
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👨💻 Author

**Built with ❤️ and 💻 by:**

[![Yash Kumar Sharma](https://img.shields.io/badge/GitHub-Yash%20Kumar%20Sharma-181717?style=for-the-badge&logo=github&logoColor=white)](https://github.com/yash-kumarsharma)

---
