const Joi= require('joi');
const todoSchema = Joi.object({
  title: Joi.string().min(3).max(100).required(),
  completed: Joi.boolean().default(false),
  collaborators: Joi.array().items(Joi.number().integer()).optional()
});

const updateTodoSchema = Joi.object({
  title: Joi.string().min(3).max(100),
    completed: Joi.boolean(),
    collaborators: Joi.array().items(Joi.number().integer())
});

module.exports = {
  todoSchema, updateTodoSchema
};