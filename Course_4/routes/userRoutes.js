/**
 * User 路由
 * 集成验证中间件
 */

const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const validate = require('../middleware/validate');
const {
  createUserSchema,
  updateUserSchema,
  querySchema,
  idParamSchema
} = require('../validators/userValidator');

// GET /api/users - 获取用户列表（验证查询参数）
router.get('/',
  validate(querySchema, 'query'),
  userController.getUsers
);

// GET /api/users/:id - 获取单个用户（验证路径参数）
router.get('/:id',
  validate(idParamSchema, 'params'),
  userController.getUserById
);

// POST /api/users - 创建用户（验证请求体）
router.post('/',
  validate(createUserSchema, 'body'),
  userController.createUser
);

// PUT /api/users/:id - 更新用户（验证路径参数和请求体）
router.put('/:id',
  validate(idParamSchema, 'params'),
  validate(updateUserSchema, 'body'),
  userController.updateUser
);

// DELETE /api/users/:id - 删除用户
router.delete('/:id',
  validate(idParamSchema, 'params'),
  userController.deleteUser
);

module.exports = router;

