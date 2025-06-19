const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: String,
    email: String,
    password: String
});

const User = mongoose.model('User', userSchema);

const boardSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: String
});

const taskSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: String,
    status: { type: String, enum: ['todo', 'in-progress', 'done'], default: 'todo' },
    priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
    assignedTo: String,
    dueDate: Date,
    boardId: { type: mongoose.Schema.Types.ObjectId, ref: 'Board', required: true },
    createdAt: { type: Date, default: Date.now }
});

const Board = mongoose.model('Board', boardSchema);
const Task = mongoose.model('Task', taskSchema);

module.exports = { User, Board, Task };