# Employee-Management-System-
A system for companies to manage stuff
# Employee Management System (EMS)

A simple, modern, and role-based **Employee Management System** built with **HTML**, **CSS**, and **JavaScript**.  
Designed for companies to manage staff, track attendance, and generate reports — all in the browser with **persistent storage** using `localStorage`.

---

## Features

- **User Authentication & Role-Based Access**  
  - Admin and Staff roles  
  - Admins can add employees, mark attendance, and generate reports  
  - Staff can view employees but cannot modify data  

- **Employee Management**  
  - Add employees with Name, Role, and Department  
  - Dynamic search/filter by name, role, or department  

- **Attendance Tracking**  
  - Mark daily attendance (Present/Absent) per employee  
  - Save attendance data persistently in browser storage  

- **Reports & Exports**  
  - Generate monthly attendance reports with summary of presents and absents  
  - Export attendance reports as **PDF** or **CSV** files  

- **User Registration**  
  - Create new users with different roles  

- **Persistent Data Storage**  
  - All data stored locally using `localStorage` for persistence across sessions  

---

## Getting Started

### Prerequisites

- Modern web browser (Chrome, Firefox, Edge, Safari)  
- No server required — runs entirely in the browser  

### How to Run

1. Clone or download the repository  
2. Open `index.html` in your preferred browser  
3. Login with default admin credentials or register a new user  

**Default Admin User:**  
- Username: `admin`  
- Password: `password123`  

---

## Usage

- **Login/Register:**  
  Sign in with your credentials or create a new account. Admin role is required to modify data.

- **Add Employees (Admin only):**  
  Fill in employee details and add them to the system.

- **Mark Attendance (Admin only):**  
  Select a date, mark each employee's attendance, and save.

- **Search Employees:**  
  Use the search box to filter employees by name, role, or department.

- **Generate Reports:**  
  Select a month to view attendance summary and download reports as PDF or CSV.

- **Logout:**  
  Securely sign out and return to the login page.

---
