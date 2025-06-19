require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const { Board, Task } = require('./model');
require('./mongo');

const app = express();
app.use(cors());

const port = process.env.PORT || 5000;

app.use(express.json());




mongoose.connect(process.env.MONGODB_URI  , {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log('Connected to MongoDB');
}).catch((err) => {
    console.log(err);
});


app.get('/', (req, res) => {
    res.send('server is running');
});


app.get('/boards', async (req, res) => {
    try {
        const boards = await Board.find();
        res.json(boards);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


app.post('/boards', async (req, res) => {
    try {
        const board = new Board(req.body);
        await board.save();
        res.status(201).json(board);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});


app.get('/boards/:id/tasks', async (req, res) => {
    try {
        const tasks = await Task.find({ boardId: req.params.id });
        res.json(tasks);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


app.post('/boards/:id/tasks', async (req, res) => {
    try {
        const task = new Task({ ...req.body, boardId: req.params.id });
        await task.save();
        res.status(201).json(task);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

app.put('/tasks/:id', async (req, res) => {
    try {
        const task = await Task.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!task) return res.status(404).json({ error: 'Task not found' });
        res.json(task);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});


app.delete('/tasks/:id', async (req, res) => {
    try {
        const task = await Task.findByIdAndDelete(req.params.id);
        if (!task) return res.status(404).json({ error: 'Task not found' });
        res.json({ message: 'Task deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});





