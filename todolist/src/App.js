import React, { useEffect, useState } from 'react';
import './App.css';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';

const API_URL = process.env.REACT_APP_API_URL ;

function App() {
  const [boards, setBoards] = useState([]);
  const [selectedBoard, setSelectedBoard] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [search, setSearch] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [taskForm, setTaskForm] = useState({ title: '', description: '', priority: 'medium', assignedTo: '', dueDate: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showBoardModal, setShowBoardModal] = useState(false);
  const [boardForm, setBoardForm] = useState({ name: '', description: '' });
  const [boardError, setBoardError] = useState('');
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState(null);
  const [editError, setEditError] = useState('');

  useEffect(() => {
    fetch(`${API_URL}/boards`)
      .then(res => res.json())
      .then(setBoards);
  }, []);

  useEffect(() => {
    if (selectedBoard) {
      fetch(`${API_URL}/boards/${selectedBoard}/tasks`)
        .then(res => res.json())
        .then(setTasks);
    }
  }, [selectedBoard]);

  const groupedTasks = {
    todo: tasks.filter(t => t.status === 'todo'),
    'in-progress': tasks.filter(t => t.status === 'in-progress'),
    done: tasks.filter(t => t.status === 'done'),
  };

  const handleTaskFormChange = e => {
    const { name, value } = e.target;
    setTaskForm(f => ({ ...f, [name]: value }));
  };

  const handleCreateTask = async e => {
    e.preventDefault();
    if (!selectedBoard) return;
    setLoading(true);
    setError('');
    try {
      const payload = {
        ...taskForm,
        dueDate: taskForm.dueDate ? new Date(taskForm.dueDate) : undefined
      };
      const res = await fetch(`${API_URL}/boards/${selectedBoard}/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Failed to create task');
        setLoading(false);
        return;
      }
      setShowTaskModal(false);
      setTaskForm({ title: '', description: '', priority: 'medium', assignedTo: '', dueDate: '' });
      // Refresh tasks
      fetch(`${API_URL}/boards/${selectedBoard}/tasks`)
        .then(res => res.json())
        .then(setTasks);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm('Delete this task?')) return;
    await fetch(`${API_URL}/tasks/${taskId}`, { method: 'DELETE' });
    // Refresh tasks
    fetch(`${API_URL}/boards/${selectedBoard}/tasks`)
      .then(res => res.json())
      .then(setTasks);
  };

  const onDragEnd = async (result) => {
    const { destination, source, draggableId } = result;
    if (!destination || destination.droppableId === source.droppableId) return;
    const task = tasks.find(t => t._id === draggableId);
    if (!task) return;
    // Update status in backend
    await fetch(`${API_URL}/tasks/${draggableId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...task, status: destination.droppableId }),
    });
    // Refresh tasks
    fetch(`${API_URL}/boards/${selectedBoard}/tasks`)
      .then(res => res.json())
      .then(setTasks);
  };

  const handleBoardFormChange = e => {
    const { name, value } = e.target;
    setBoardForm(f => ({ ...f, [name]: value }));
  };

  const handleCreateBoard = async e => {
    e.preventDefault();
    setBoardError('');
    try {
      const res = await fetch(`${API_URL}/boards`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(boardForm),
      });
      if (!res.ok) {
        const data = await res.json();
        setBoardError(data.error || 'Failed to create board');
        return;
      }
      setShowBoardModal(false);
      setBoardForm({ name: '', description: '' });
      // Refresh boards
      fetch(`${API_URL}/boards`)
        .then(res => res.json())
        .then(setBoards);
    } catch (err) {
      setBoardError('Failed to create board');
    }
  };

  const openEditModal = (task) => {
    setEditForm({ ...task, dueDate: task.dueDate ? new Date(task.dueDate).toISOString().slice(0, 10) : '' });
    setEditError('');
    setShowEditModal(true);
  };

  const handleEditFormChange = e => {
    const { name, value } = e.target;
    setEditForm(f => ({ ...f, [name]: value }));
  };

  const handleEditTask = async e => {
    e.preventDefault();
    setEditError('');
    try {
      const payload = {
        ...editForm,
        dueDate: editForm.dueDate ? new Date(editForm.dueDate) : undefined
      };
      const res = await fetch(`${API_URL}/tasks/${editForm._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const data = await res.json();
        setEditError(data.error || 'Failed to update task');
        return;
      }
      setShowEditModal(false);
      setEditForm(null);
      // Refresh tasks
      fetch(`${API_URL}/boards/${selectedBoard}/tasks`)
        .then(res => res.json())
        .then(setTasks);
    } catch (err) {
      setEditError('Failed to update task');
    }
  };

  return (
    <div className="app-layout">
      <aside className="sidebar">
        <h2>Boards</h2>
        <ul>
          {boards.map(board => (
            <li
              key={board._id}
              className={selectedBoard === board._id ? 'active' : ''}
              onClick={() => setSelectedBoard(board._id)}
            >
              {board.name}
            </li>
          ))}
        </ul>
        <button className="create-board-btn" onClick={() => setShowBoardModal(true)}>
          + Create Board
        </button>
      </aside>
      <main className="board-detail">
        <div className="board-header">
          <input
            type="text"
            placeholder="Search tasks..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <select value={priorityFilter} onChange={e => setPriorityFilter(e.target.value)}>
            <option value="">All Priorities</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
          <button onClick={() => setShowTaskModal(true)} >
            + Create Task
          </button>
        </div>
        <DragDropContext onDragEnd={onDragEnd}>
          <div className="task-columns">
            {['todo', 'in-progress', 'done'].map(status => (
              <Droppable droppableId={status} key={status}>
                {(provided, snapshot) => (
                  <div
                    className={`task-column${snapshot.isDraggingOver ? ' dragging-over' : ''}`}
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                  >
                    <h3>{status.replace('-', ' ').toUpperCase()}</h3>
                    <ul>
                      {groupedTasks[status]
                        .filter(task =>
                          (!search || task.title.toLowerCase().includes(search.toLowerCase())) &&
                          (!priorityFilter || task.priority === priorityFilter)
                        )
                        .map((task, idx) => (
                          <Draggable draggableId={task._id} index={idx} key={task._id}>
                            {(provided, snapshot) => (
                              <li
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                className={`task-card priority-${task.priority || 'none'}${snapshot.isDragging ? ' dragging' : ''}`}
                              >
                                <div className="task-title">{task.title}</div>
                                {task.priority && (
                                  <span className={`priority-badge ${task.priority}`}>{task.priority}</span>
                                )}
                                <div className="task-meta">
                                  {task.assignedTo && <span className="assigned-to">👤 {task.assignedTo}</span>}
                                  {task.dueDate && <span className="due-date">📅 {new Date(task.dueDate).toLocaleDateString()}</span>}
                                </div>
                                <div className="task-actions">
                                  <button className="edit-btn" onClick={() => openEditModal(task)}>Edit</button>
                                  <button className="delete-btn" onClick={() => handleDeleteTask(task._id)}>Delete</button>
                                </div>
                              </li>
                            )}
                          </Draggable>
                        ))}
                      {provided.placeholder}
                    </ul>
                  </div>
                )}
              </Droppable>
            ))}
          </div>
        </DragDropContext>
        {showTaskModal && (
          <div className="modal-backdrop">
            <div className="modal">
              <h2>Create Task</h2>
              {error && <div className="error-message">{error}</div>}
              <form onSubmit={handleCreateTask}>
                <label>
                  Title
                  <input
                    name="title"
                    value={taskForm.title}
                    onChange={handleTaskFormChange}
                    required
                  />
                </label>
                <label>
                  Description
                  <textarea
                    name="description"
                    value={taskForm.description}
                    onChange={handleTaskFormChange}
                  />
                </label>
                <label>
                  Priority
                  <select
                    name="priority"
                    value={taskForm.priority}
                    onChange={handleTaskFormChange}
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </label>
                <label>
                  Assigned To
                  <input
                    name="assignedTo"
                    value={taskForm.assignedTo}
                    onChange={handleTaskFormChange}
                  />
                </label>
                <label>
                  Due Date
                  <input
                    name="dueDate"
                    type="date"
                    value={taskForm.dueDate}
                    onChange={handleTaskFormChange}
                  />
                </label>
                <div className="modal-actions">
                  <button type="button" onClick={() => setShowTaskModal(false)} disabled={loading}>
                    Cancel
                  </button>
                  <button type="submit" disabled={loading} >
                    {loading ? 'Creating...' : 'Create'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
        {showBoardModal && (
          <div className="modal-backdrop">
            <div className="modal">
              <h2>Create Board</h2>
              {boardError && <div className="error-message">{boardError}</div>}
              <form onSubmit={handleCreateBoard}>
                <label>
                  Name
                  <input
                    name="name"
                    value={boardForm.name}
                    onChange={handleBoardFormChange}
                    required
                  />
                </label>
                <label>
                  Description
                  <textarea
                    name="description"
                    value={boardForm.description}
                    onChange={handleBoardFormChange}
                  />
                </label>
                <div className="modal-actions">
                  <button type="button" onClick={() => setShowBoardModal(false)}>
                    Cancel
                  </button>
                  <button type="submit">
                    Create
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
        {showEditModal && editForm && (
          <div className="modal-backdrop">
            <div className="modal">
              <h2>Edit Task</h2>
              {editError && <div className="error-message">{editError}</div>}
              <form onSubmit={handleEditTask}>
                <label>
                  Title
                  <input
                    name="title"
                    value={editForm.title}
                    onChange={handleEditFormChange}
                    required
                  />
                </label>
                <label>
                  Description
                  <textarea
                    name="description"
                    value={editForm.description}
                    onChange={handleEditFormChange}
                  />
                </label>
                <label>
                  Priority
                  <select
                    name="priority"
                    value={editForm.priority}
                    onChange={handleEditFormChange}
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </label>
                <label>
                  Assigned To
                  <input
                    name="assignedTo"
                    value={editForm.assignedTo}
                    onChange={handleEditFormChange}
                  />
                </label>
                <label>
                  Due Date
                  <input
                    name="dueDate"
                    type="date"
                    value={editForm.dueDate}
                    onChange={handleEditFormChange}
                  />
                </label>
                <div className="modal-actions">
                  <button type="button" onClick={() => setShowEditModal(false)}>
                    Cancel
                  </button>
                  <button type="submit">
                    Save
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
