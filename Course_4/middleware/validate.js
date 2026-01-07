/**
 * 数据验证中间件
 * 
 * 使用 Joi 库进行数据验证
 * Joi 是 Node.js 最流行的验证库之一
 * 
 * 前端类比：
 * - 类似 ElementUI 的表单验证 rules
 * - 类似 VeeValidate / Yup
 */

const Joi = require('joi');
const { BadRequestError } = require('../utils/AppError');

/**
 * 创建验证中间件
 * @param {Joi.Schema} schema - Joi 验证规则
 * @param {string} property - 要验证的属性：'body', 'query', 'params'
 */
const validate = (schema, property = 'body') => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req[property], {
      abortEarly: false,  // 返回所有错误，而不是遇到第一个就停止
      stripUnknown: true  // 移除未知字段
    });
    
    if (error) {
      // 格式化错误信息
      const messages = error.details.map(detail => detail.message).join('; ');
      return next(new BadRequestError(messages));
    }
    
    // 将验证后的值（已过滤和转换）放回请求对象
    req[property] = value;
    next();
  };
};

module.exports = validate;

