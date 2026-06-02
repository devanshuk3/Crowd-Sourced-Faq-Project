# Samagama FAQ Platform

A community-driven FAQ platform for Samagama participants. Built with React + TanStack Router/Query on the frontend and Express + Mongoose on the backend.

---

## Tech Stack

| Layer      | Tech                                      |
|------------|-------------------------------------------|
| Frontend   | React, Vite, TanStack Router, TanStack Query |
| Backend    | Node.js, Express, Mongoose                |
| Database   | MongoDB                                   |
| Styling    | Custom CSS (no UI library)                |

---

## Project Structure

```
samagama/
├── backend/
│   ├── src/
│   │   ├── models/
│   │   │   ├── faq.model.js
│   │   │   └── answer.model.js
│   │   ├── controllers/
│   │   │   ├── faq.controller.js
│   │   │   └── answer.controller.js
│   │   ├── routes/
│   │   │   ├── faq.routes.js
│   │   │   └── answer.routes.js
│   │   └── app.js
│   ├── seed.js
│   ├── .env
│   └── package.json
└── frontend/
    ├── src/
    │   ├── api/index.js
    │   ├── components/
    │   │   ├── Nav.jsx
    │   │   ├── FAQCard.jsx
    │   │   └── Skeleton.jsx
    │   ├── pages/
    │   │   ├── BrowsePage.jsx
    │   │   ├── AskPage.jsx
    │   │   ├── AnswerPage.jsx
    │   │   ├── FAQDetailPage.jsx
    │   │   └── StatsPage.jsx
    │   ├── router.jsx
    │   ├── main.jsx
    │   └── index.css
    └── package.json
```

---

## Prerequisites

- Node.js v18+
- MongoDB running locally on port 27017

---

## Setup & Run

### 1. Start MongoDB

Make sure MongoDB is running locally:
```bash
mongod
```

### 2. Backend

```bash
cd backend
npm install
npm run seed     # optional: load sample data
npm run dev      # starts on http://localhost:3001
```

### 3. Frontend

```bash
cd frontend
npm install
npm run dev      # starts on http://localhost:5173
```

Open **http://localhost:5173** in your browser.

---

## API Reference

### FAQ Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | /faqs | List all FAQs (with pagination, sort, filter) |
| GET | /faqs/:id | Get single FAQ with answers |
| POST | /faqs | Create new FAQ |
| PUT | /faqs/:id | Update FAQ |
| DELETE | /faqs/:id | Delete FAQ + all answers |
| GET | /faqs/unanswered | List unanswered FAQs |
| GET | /faqs/popular | Top FAQs by upvotes |
| GET | /faqs/search?q= | Full-text search |
| GET | /faqs/similar?q= | Duplicate detection |
| GET | /faqs/stats | Dashboard statistics |
| POST | /faqs/:id/upvote | Upvote a FAQ |

### Answer Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | /answers/:faqId | Get all answers for a FAQ |
| POST | /answers | Submit an answer |
| PUT | /answers/:id | Edit an answer |
| DELETE | /answers/:id | Delete an answer |
| POST | /answers/:id/upvote | Upvote an answer |

### Query Parameters for GET /faqs

| Param | Values | Default |
|-------|--------|---------|
| page | number | 1 |
| limit | number | 10 |
| category | Registration, Technical Events, Cultural Events, Accommodation, Transportation, General Information | — |
| sort | newest, popular, views | newest |

---

## Features

- Browse, search, filter, and sort FAQs
- Full-text search across title, description, and tags
- Ask new questions with duplicate detection
- Answer unanswered questions
- Upvote FAQs and answers
- FAQ detail page with inline answer form
- Analytics dashboard with answer rate progress bar
- Skeleton loading states
- Toast notifications
- Pagination
- Auto status update (Unanswered → Answered) on first answer
- Responsive layout

---

## Environment Variables (backend/.env)

```
PORT=3001
MONGO_URI=mongodb://localhost:27017/samagama
CLIENT_URL=http://localhost:5173
```
