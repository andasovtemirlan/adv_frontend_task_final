#!/usr/bin/env bash
# Quick Start Guide - Project Management System

# ==========================================
# DEVELOPMENT SETUP
# ==========================================

# 1. Install dependencies (if not already done)
npm install

# 2. Terminal 1: Start frontend development server
npm run dev
# Opens at: http://localhost:3000

# 3. Terminal 2: Start backend mock server
npm run server
# Runs at: http://localhost:3001

# 4. Login to application
Email:    admin@example.com
Password: admin123

# ==========================================
# AVAILABLE COMMANDS
# ==========================================

# Development
npm run dev              # Start Vite dev server
npm run server          # Start JSON Server

# Build & Deploy
npm run build           # Create production build
npm run preview         # Preview production build

# Testing
npm test                # Run tests once
npm test -- --watch    # Watch mode for tests
npm test:ui            # Vitest UI dashboard
npm test:coverage      # Generate coverage report

# Code Quality
npm run lint            # Run ESLint
npm run format          # Format code with Prettier

# Docker (if needed)
docker-compose up       # Start all services
docker build -t pms .   # Build image

# ==========================================
# FEATURE OVERVIEW
# ==========================================

# Dashboard
# └─ Quick stats (projects, tasks, members)
# └─ Recent projects with progress
# └─ Activity feed (real-time updates)

# Projects
# └─ List all projects
# └─ Search by name (real-time)
# └─ Filter by status
# └─ Create/Edit/Delete projects

# Tasks (Kanban)
# └─ 5-column board
# └─ Backlog → Todo → In Progress → Review → Done
# └─ Task cards with priority & assignees

# Teams
# └─ Team listing
# └─ Team information
# └─ Member counts

# Activity
# └─ System event timeline
# └─ Color-coded activity types
# └─ Auto-logged on all CRUD operations

# ==========================================
# TEST USERS (Pre-seeded)
# ==========================================

# Admin
Email: admin@example.com
Pass:  admin123

# Developer
Email: john.doe@example.com
Pass:  Password123!

# Designer
Email: mike.wilson@example.com
Pass:  Password123!

# ==========================================
# TECH STACK
# ==========================================

Frontend:
  React 18.2.0
  TypeScript 5.9.3
  Vite 7.3.1
  Redux Toolkit 2.11.2
  RTK Query
  Material-UI v5
  React Router v6

Backend:
  JSON Server 0.17.4
  json-server-auth
  bcryptjs

Testing:
  Vitest
  React Testing Library
  @testing-library/jest-dom
  jsdom

DevOps:
  Docker
  Docker Compose
  Nginx

# ==========================================
# PROJECT STRUCTURE
# ==========================================

src/
├── features/
│   ├── dashboard/
│   ├── projects/
│   ├── tasks/
│   ├── teams/
│   └── activity/
├── store/
│   ├── api.ts
│   └── slices/
├── shared/
│   ├── components/
│   ├── hooks/
│   ├── utils/
│   └── types/
└── App.tsx

test/
├── setup.ts
└── features/

server/
├── db.json
└── routes.json

# ==========================================
# KEY FILES TO KNOW
# ==========================================

# Redux Store
src/store/api.ts          # RTK Query endpoints
src/store/slices/         # Redux slices

# Features
src/features/*/containers/  # Logic components
src/features/*/components/  # UI components
src/features/*/pages/       # Route pages

# Configuration
vite.config.ts           # Build config
vitest.config.ts        # Test config
tsconfig.json           # TypeScript config
tailwind.config.js      # Styling config

# Documentation
README.md               # Getting started
REPORT.md              # Technical deep-dive
PLAN.md                # Development roadmap
PROJECT_SUMMARY.md     # Quick reference

# ==========================================
# USEFUL LINKS
# ==========================================

Frontend:    http://localhost:3000
Backend:     http://localhost:3001/
API Docs:    http://localhost:3001/

# ==========================================
# TROUBLESHOOTING
# ==========================================

# Port already in use?
# Change port in vite.config.ts (dev.port)
# Backend: package.json (json-server --port 3002)

# Login not working?
# Check: server/db.json for user credentials
# Verify: bcrypt hash matches password

# Build issues?
# Delete: node_modules/ and dist/
# Run: npm install && npm run build

# Tests not running?
# Install: npm install --save-dev vitest
# Check: vitest.config.ts configuration

# ==========================================
# DOCUMENTATION
# ==========================================

See:
- README.md          for getting started
- REPORT.md          for architecture & technical details
- PLAN.md            for development roadmap
- PROJECT_SUMMARY.md for feature overview

All generated: February 3, 2026
Version: 1.0.0
Status: Production Ready ✅
