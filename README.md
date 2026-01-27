# 📝 FormForge - Dynamic Form Builder

A scalable, real-time **form creation and collaboration platform** that allows users to build custom forms, share them via links, collect submissions, and collaborate live—similar to Google Forms.

> Built using **Node.js**, **Express**, **PostgreSQL**, **Prisma ORM**, **Redis**, **WebSockets**, and **JWT-based authentication**.

---

## 🚀 Features

- 🔐 **JWT Authentication & Authorization**
  - Secure signup/login
  - Owner & collaborator-based access control
- 🧩 **Dynamic Form Builder**
  - Create forms with multiple field types
  - Add, reorder, and configure fields
- 🤝 **Real-Time Collaboration**
  - Multiple users can edit the same form simultaneously
  - Live updates using WebSockets
- 🔗 **Shareable Form Links**
  - Public form access via unique tokens
- 📩 **Form Submissions**
  - Collect and store responses securely
  - View submissions in real time
- ⚡ **Performance Optimization**
  - Redis-based caching
  - Indexed database queries
- 🧱 **Modular Backend Architecture**
  - Clean separation of routes, controllers, services, and middleware

---

## 🧰 Tech Stack

| Category | Tech Stack |
|----------|------------|
| **Backend** | Node.js, Express.js |
| **Database** | PostgreSQL |
| **ORM** | Prisma ORM |
| **Authentication** | JWT (JSON Web Tokens) |
| **Real-Time Communication** | WebSockets (`ws`) |
| **Caching** | Redis |
| **Frontend** | HTML, CSS, Vanilla JavaScript |
| **Dev Tools** | Prisma CLI, dotenv, npm |

---

## 📁 Folder Structure

```text
├── config/
│   ├── prisma.js
│   └── redisClient.js
├── controllers/
│   ├── authController.js
│   ├── formsController.js
│   └── collaboratorsController.js
├── middlewares/
│   ├── authMiddleware.js
│   └── cacheMiddleware.js
├── routes/
│   ├── auth.js
│   ├── forms.js
│   ├── collaborators.js
│   └── submissions.js
├── services/
│   ├── formService.js
│   └── permissionService.js
├── utils/
│   └── ws.js
├── public/
│   ├── css/
│   ├── js/
│   └── images/
├── views/
│   ├── index.html
│   ├── dashboard.html
│   ├── formBuilder.html
│   ├── shareForm.html
│   └── submissions.html
├── prisma/
│   └── schema.prisma
├── .env
├── server.js
├── package.json
└── README.md

---
```

## 🧑‍💻 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/yash-kumarsharma/Admin-Product-Dashboard.git
cd Admin-Product-Dashboard
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Create a `.env` file in the root directory and add:

```env
MONGO_URI=enter-your-mongodb-url-here
SESSION_SECRET=enter-your-secret-key-here
```

### 4. Start the Application

```bash
node server.js
```

Visit: [http://localhost:3000](http://localhost:3000)

---

## 💡 Usage

- Sign up with a new user account.
- Add, update, or delete products.
- Session persists while logged in.
- Logout securely from the navbar.

---

## 👨‍💻 Made By

Built with 💻 and ☕ by:

[![Yash Kumar Sharma](https://img.shields.io/badge/GitHub-Yash%20Kumar%20Sharma-181717?style=for-the-badge&logo=github&logoColor=white)](https://github.com/yash-kumarsharma)
[![Prabhnoor Singh](https://img.shields.io/badge/GitHub-Prabhnoor%20Singh-181717?style=for-the-badge&logo=github&logoColor=white)](https://github.com/SinghPrabhnoor)

> We collaborated on this project as part of a real-world learning sprint to improve our development skills.

---

⭐ Star this repo if you found it helpful!
