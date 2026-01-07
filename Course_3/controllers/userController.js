/**
 * User 控制器 - MVC 中的 Controller 层
 * 
 * 职责：处理请求，调用 Model，返回响应
 * 不包含业务逻辑，只负责"调度"
 */

const User = require('../models/User');

/**
 * 获取所有用户
 * GET /api/users
 */
const getUsers = (req, res) => {
  const users = User.findAll();
  res.json({
    total: users.length,
    data: users
  });
};

/**
 * 获取单个用户
 * GET /api/users/:id
 */
const getUserById = (req, res) => {
  const id = parseInt(req.params.id);
  const user = User.findById(id);
  
  if (!user) {
    return res.status(404).json({ error: '用户不存在' });
  }
  
  res.json(user);
};

/**
 * 创建用户
 * POST /api/users
 */
const createUser = (req, res) => {
  const { name, email, age, role } = req.body;
  
  if (!name || !email) {
    return res.status(400).json({ error: '缺少必填字段: name, email' });
  }
  
  const newUser = User.create({ name, email, age, role: role || 'user' });
  res.status(201).json(newUser);
};

/**
 * 更新用户
 * PUT /api/users/:id
 */
const updateUser = (req, res) => {
  const id = parseInt(req.params.id);
  const updatedUser = User.update(id, req.body);
  
  if (!updatedUser) {
    return res.status(404).json({ error: '用户不存在' });
  }
  
  res.json(updatedUser);
};

/**
 * 删除用户
 * DELETE /api/users/:id
 */
const deleteUser = (req, res) => {
  const id = parseInt(req.params.id);
  const success = User.remove(id);
  
  if (!success) {
    return res.status(404).json({ error: '用户不存在' });
  }
  
  res.sendStatus(204);
};

module.exports = {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser
};

