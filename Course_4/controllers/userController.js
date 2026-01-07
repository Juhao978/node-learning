/**
 * User 控制器
 * 使用 asyncHandler 包装异步函数
 */

const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');
const { NotFoundError, BadRequestError } = require('../utils/AppError');

// 获取所有用户
const getUsers = asyncHandler(async (req, res) => {
  // 验证后的查询参数在 req.query 中
  const { page, limit, sort, order } = req.query;
  
  let users = User.findAll();
  
  // 排序
  users.sort((a, b) => {
    const aVal = a[sort];
    const bVal = b[sort];
    return order === 'asc' ? (aVal > bVal ? 1 : -1) : (aVal < bVal ? 1 : -1);
  });
  
  // 分页
  const start = (page - 1) * limit;
  const paginatedUsers = users.slice(start, start + limit);
  
  res.json({
    data: paginatedUsers,
    pagination: {
      page,
      limit,
      total: users.length,
      totalPages: Math.ceil(users.length / limit)
    }
  });
});

// 获取单个用户
const getUserById = asyncHandler(async (req, res) => {
  const user = User.findById(req.params.id);
  
  if (!user) {
    throw new NotFoundError('用户不存在');
  }
  
  res.json(user);
});

// 创建用户
const createUser = asyncHandler(async (req, res) => {
  // 检查邮箱是否已存在
  const existingUser = User.findByEmail(req.body.email);
  if (existingUser) {
    throw new BadRequestError('邮箱已被注册');
  }
  
  const newUser = User.create(req.body);
  res.status(201).json(newUser);
});

// 更新用户
const updateUser = asyncHandler(async (req, res) => {
  const updatedUser = User.update(req.params.id, req.body);
  
  if (!updatedUser) {
    throw new NotFoundError('用户不存在');
  }
  
  res.json(updatedUser);
});

// 删除用户
const deleteUser = asyncHandler(async (req, res) => {
  const success = User.remove(req.params.id);
  
  if (!success) {
    throw new NotFoundError('用户不存在');
  }
  
  res.sendStatus(204);
});

module.exports = {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser
};

