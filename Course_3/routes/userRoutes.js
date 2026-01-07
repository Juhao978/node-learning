/**
 * User 路由 - MVC 中的 Route 层
 * 
 * 职责：定义 URL 和 HTTP 方法，映射到 Controller
 * 
 * 使用 express.Router() 创建模块化路由
 */

const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

/**
 * express.Router() 详解
 * 
 * 它创建一个"迷你 Express 应用"，可以：
 * - 定义路由
 * - 使用中间件
 * - 最后挂载到主应用上
 * 
 * 类似前端的：
 * - Vue Router 的子路由
 * - React Router 的嵌套路由
 */

// GET /api/users
router.get('/', userController.getUsers);

// GET /api/users/:id
router.get('/:id', userController.getUserById);

// POST /api/users
router.post('/', userController.createUser);

// PUT /api/users/:id
router.put('/:id', userController.updateUser);

// DELETE /api/users/:id
router.delete('/:id', userController.deleteUser);

module.exports = router;

