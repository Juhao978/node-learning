/**
 * JWT 认证中间件
 * 
 * 验证请求中的 JWT Token
 * 
 * 前端类比：
 * 这就像 axios 请求拦截器检查 token 是否存在
 * 只不过是在后端验证 token 是否有效
 */

const jwt = require('jsonwebtoken');
const jwtConfig = require('../config/jwt');
const User = require('../models/User');

/**
 * 验证 Token 中间件
 */
const authenticate = async (req, res, next) => {
  try {
    // 1. 从请求头获取 token
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: '未提供认证令牌',
        message: '请在请求头中添加 Authorization: Bearer <token>'
      });
    }
    
    // 2. 提取 token
    const token = authHeader.split(' ')[1];
    
    // 3. 验证 token
    const decoded = jwt.verify(token, jwtConfig.secret);
    
    // 4. 查找用户
    const user = await User.findByPk(decoded.userId);
    
    if (!user || !user.isActive) {
      return res.status(401).json({ error: '用户不存在或已被禁用' });
    }
    
    // 5. 将用户信息附加到请求对象
    req.user = user.toSafeObject();
    req.userId = decoded.userId;
    
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token 已过期，请重新登录' });
    }
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Token 无效' });
    }
    return res.status(500).json({ error: error.message });
  }
};

/**
 * 检查角色权限
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: '请先登录' });
    }
    
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        error: '权限不足',
        message: `需要 ${roles.join(' 或 ')} 权限`
      });
    }
    
    next();
  };
};

/**
 * 可选认证（不强制要求登录）
 */
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, jwtConfig.secret);
      const user = await User.findByPk(decoded.userId);
      
      if (user && user.isActive) {
        req.user = user.toSafeObject();
        req.userId = decoded.userId;
      }
    }
    
    next();
  } catch {
    // Token 无效，但不阻止请求
    next();
  }
};

module.exports = { authenticate, authorize, optionalAuth };

