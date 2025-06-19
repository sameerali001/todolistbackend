# Team Collaboration Board (MERN Trello/Asana Clone)

A simple team collaboration board built with the MERN stack (MongoDB, Express, React, Node.js). Manage boards and tasks with drag-and-drop, priorities, assignments, and due dates.

## Features
- Create, edit, and delete boards
- Create, edit, and delete tasks within boards
- Tasks have title, description, status, priority, assignedTo, and dueDate
- Drag and drop tasks between status columns (To Do, In Progress, Done)
- Search and filter tasks by priority
- Responsive, clean UI with modals for forms

## Getting Started

### Prerequisites
- Node.js (v18+ recommended)
- npm
- MongoDB (local or cloud)

### Backend Setup
1. Open a terminal and navigate to the `backend` folder:
   ```sh
   cd backend
   ```
2. Install dependencies:
   ```sh
   npm install
   ```
3. Start MongoDB if not already running (default URI is `mongodb://localhost:27017/mydatabase`).
4. Start the backend server:
   ```sh
   node index.js
   ```
   The backend runs on `http://localhost:5000` by default.

### Frontend Setup
1. Open a new terminal and navigate to the `todolist` folder:
   ```sh
   cd todolist
   ```
2. Install dependencies:
   ```sh
   npm install
   ```
3. Start the React development server:
   ```sh
   npm start
   ```
   The frontend runs on `http://localhost:3000` by default.

### Production Build (Optional)
To build the frontend for production:
```sh
cd todolist
npm run build
```
You can serve the build folder with a static server or configure the backend to serve it.

## API Endpoints
- `GET /boards` – List all boards
- `POST /boards` – Create a new board
- `GET /boards/:id/tasks` – List tasks in a board
- `POST /boards/:id/tasks` – Create a task in a board
- `PUT /tasks/:id` – Update a task
- `DELETE /tasks/:id` – Delete a task

## Notes
- No authentication (single user only)
- Make sure MongoDB is running before starting the backend
- For any issues, check the browser console and backend terminal for error messages

---

**Enjoy collaborating with your team!** 