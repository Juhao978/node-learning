/**
 * User 控制器 - 使用 Sequelize 操作数据库
 */

const { User } = require('../models');
const { Op } = require('sequelize');

// 获取所有用户
const getUsers = async (req, res) => {
  try {
    const { page = 1, limit = 10, search } = req.query;
    
    // 构建查询条件
    const where = {};
    if (search) {
      where[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } }
      ];
    }
    
    // 分页查询
    const { count, rows } = await User.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset: (parseInt(page) - 1) * parseInt(limit),
      order: [['created_at', 'DESC']],
      attributes: { exclude: ['password'] }  // 排除密码字段
    });
    
    res.json({
      data: rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count,
        totalPages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 获取单个用户
const getUserById = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id, {
      attributes: { exclude: ['password'] }
    });
    
    if (!user) {
      return res.status(404).json({ error: '用户不存在' });
    }
    
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 创建用户
const createUser = async (req, res) => {
  try {
    const { name, email, age, role, password } = req.body;
    
    // 检查邮箱是否已存在
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: '邮箱已被注册' });
    }
    
    const user = await User.create({
      name,
      email,
      age,
      role,
      password  // 实际项目中需要加密
    });
    
    // 移除密码后返回
    const userData = user.toJSON();
    delete userData.password;
    
    res.status(201).json(userData);
  } catch (error) {
    // Sequelize 验证错误
    if (error.name === 'SequelizeValidationError') {
      const messages = error.errors.map(e => e.message).join('; ');
      return res.status(400).json({ error: messages });
    }
    res.status(500).json({ error: error.message });
  }
};

// 更新用户
const updateUser = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    
    if (!user) {
      return res.status(404).json({ error: '用户不存在' });
    }
    
    await user.update(req.body);
    
    const userData = user.toJSON();
    delete userData.password;
    
    res.json(userData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 删除用户
const deleteUser = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    
    if (!user) {
      return res.status(404).json({ error: '用户不存在' });
    }
    
    await user.destroy();
    res.sendStatus(204);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser
};

