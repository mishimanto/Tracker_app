# Tracker - Expense & Task Management System

A modern, full-stack **Expense, Task, and Productivity Management System** built with a powerful combination of backend and frontend technologies. This project is designed for both **personal use and scalable SaaS-level applications**.

---

## 📌 Features

### 👤 User Features

* User Authentication (Register, Login, Forgot Password)
* Dashboard with analytics
* Expense tracking & categorization
* Task management system
* Notes / Notepad system
* Calendar view for activities
* Profile management
* Reports & insights

---

### 🛠️ Admin Features

* Admin Dashboard
* User management
* Expense monitoring
* Feedback system & reply
* Activity logs
* Reports & analytics
* Site settings control

---

### 📊 Core Modules

* 💰 Expense Management
* 📅 Calendar & Activity Tracking
* 📝 Notes System
* 📈 Dashboard Analytics
* 🔔 Notifications (Budget exceeded, Task deadlines)
* 📬 Feedback System
* 📄 SEO Optimization + Pre-rendering

---

## 🏗️ Tech Stack

### 🔹 Backend

* PHP (Laravel Framework)
* RESTful API
* MySQL / SQLite
* Laravel Sanctum (Authentication)

### 🔹 Frontend

* React + TypeScript
* Vite
* Tailwind CSS
* State Management (Custom Store)
* API Integration

---

## ⚙️ Installation Guide

### 🔧 Backend Setup

```bash
cd backend
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate --seed
php artisan serve
```

---

### 💻 Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

---

## 🔐 Environment Setup

### Backend `.env`

* Database configuration
* Mail settings
* Sanctum setup

### Frontend `.env`

* API Base URL

---

## 🌐 API Integration

* All frontend requests handled via centralized API service
* Token-based authentication using Laravel Sanctum

---

## 📦 Key Functionalities

* Real-time dashboard stats
* Budget tracking with alerts
* Task deadline reminders
* Feedback system with admin reply
* Report generation

---

## 🚀 Future Improvements

* Payment integration
* Multi-language support
* Mobile app version
* Advanced analytics with charts

---

## 👨‍💻 Author

Developed by **Moynul Islam Shimanto**

---

⭐ If you like this project, don't forget to star the repository!
