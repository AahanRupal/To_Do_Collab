const express = require('express');
const prisma = require('../prisma/client');
const validate = require('../Middleware/validate');
const verifyToken = require('../Middleware/authMiddleware');
const logger = require('../Middleware/logger');
const { todoSchema, updateTodoSchema } = require('../schemas/todoSchema');

const router = express.Router();

// Create a todo (with optional collaborators)
router.post('/', logger, verifyToken, validate(todoSchema), async (req, res) => {
  const { title, completed, collaborators } = req.body;

  try {
    const todo = await prisma.todo.create({
      data: {
        title,
        completed: completed || false,
        owner: { connect: { id: req.userId } },
        collaborations: collaborators
          ? {
              create: collaborators.map(userId => ({
                user: { connect: { id: userId } },
              })),
            }
          : undefined,
      },
      include: {
        collaborations: {
          include: {
            user: true,
          },
        },
      },
    });

    res.status(201).json({ status: 'success', data: todo });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});


// Get all todos where user is owner or collaborator
router.get('/', logger, verifyToken, async (req, res) => {
  try {
    const ownedTodos = await prisma.todo.findMany({
      where: { ownerId: req.userId },
      include: {
        collaborations: {
          include: { user: true }
        },
      },
    });

    const collaboratedTodos = await prisma.todo.findMany({
      where: {
        collaborations: {
          some: {
            userId: req.userId
          }
        },
      },
      include: {
        collaborations: {
          include: { user: true }
        },
        owner: true
      },
    });

    res.json({ data: [...ownedTodos, ...collaboratedTodos] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


// Get a single todo if user is owner or collaborator
router.get('/:id', logger, verifyToken, async (req, res) => {
  const todoId = parseInt(req.params.id);
  try {
    const todo = await prisma.todo.findFirst({
      where: {
        id: todoId,
        OR: [
          { ownerId: req.userId },
          {
            collaborations: {
              some: { userId: req.userId },
            },
          },
        ],
      },
      include: {
        collaborations: {
          include: { user: true }
        },
        owner: true,
      },
    });

    if (!todo) return res.status(404).json({ error: 'Todo not found' });
    res.json({ data: todo });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


// Update a todo — only owner can update
// Example for update
router.put('/:id', logger, verifyToken, validate(updateTodoSchema), async (req, res) => {
  const todoId = parseInt(req.params.id);
  try {
    const todo = await prisma.todo.updateMany({
      where: {
        id: todoId,
        ownerId: req.userId
      },
      data: req.body,
    });

    if (todo.count === 0) return res.status(404).json({ error: 'Todo not found or not authorized' });
    res.json({ message: 'Todo updated' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


// Delete a todo — only owner can delete
router.delete('/:id', logger, verifyToken, async (req, res) => {
  try {
    const deleted = await prisma.todo.deleteMany({
      where: {
        id: parseInt(req.params.id),
        ownerId: req.userId,
      },
    });

    if (deleted.count === 0) return res.status(404).json({ error: 'Todo not found or access denied' });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
