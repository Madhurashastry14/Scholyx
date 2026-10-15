# 🎓 Scholarship Information and Eligibility Checker

A web-based platform designed to help students discover scholarships and determine their eligibility based on academic performance, family income, category, course, and other scholarship requirements.

## 📌 About the Project

Finding suitable scholarships can be difficult because eligibility criteria differ for every scholarship. This project aims to provide a centralized platform where students can explore scholarship opportunities and check whether they meet the required eligibility criteria.

The system will allow students to enter their details and receive relevant scholarship information based on their profile.

## ✨ Key Features

- 🔍 Browse and search available scholarships
- 🎯 Check scholarship eligibility
- 📋 View scholarship eligibility criteria
- 💰 View scholarship benefits and amount
- 📅 View application deadlines
- 📄 View required documents
- 🔖 Save relevant scholarships

## 🛠️ Technology Stack

### Frontend

- React.js

### Backend

- Python
- Django / Django REST Framework

### Database

- MySQL

### Tools

- Git & GitHub
- VS Code
- Postman

## 🚧 Project Status

**Currently under development.**

The project structure and core features are being implemented. More features will be added as development progresses.

## Student registration API

`POST /api/auth/register/` creates a Django user and an associated student profile in one database transaction. Send JSON with all of these fields:

| Field | Description |
| --- | --- |
| `username` | Unique account username |
| `email` | Valid email address, unique without regard to case |
| `password` | Password that passes Django's configured password validators |
| `full_name` | Student's full name |
| `date_of_birth` | Date in `YYYY-MM-DD` format, in the past |
| `phone_number` | Phone number with 7-15 digits; an optional leading `+` is accepted |
| `institution_name` | Student's school or college |
| `course` | Student's course of study |
| `year_of_study` | `1` through `6`, or `postgraduate` |

Successful requests return `201 Created` with the account and profile fields (never the password). Invalid input and duplicate accounts return `400 Bad Request` with field-level errors.

```json
{
  "username": "student-one",
  "email": "student@example.com",
  "password": "a-strong-password",
  "full_name": "Student One",
  "date_of_birth": "2005-06-15",
  "phone_number": "+919876543210",
  "institution_name": "Scholyx University",
  "course": "Computer Science",
  "year_of_study": "2"
}
```

## 👥 Team

Akanksha
G Madhura Shastry
Muralikrishna D
Niveditha Marcopolo Totar

This project is being developed as a college mini project.

---
