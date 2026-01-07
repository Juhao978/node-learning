/**
 * 用户数据验证规则
 * 
 * 使用 Joi 定义验证规则
 * 
 * Joi 常用验证方法：
 * - string()      字符串
 * - number()      数字
 * - email()       邮箱格式
 * - min(n)        最小长度/值
 * - max(n)        最大长度/值
 * - required()    必填
 * - optional()    可选
 * - valid(...)    枚举值
 * - pattern()     正则匹配
 */

const Joi = require('joi');

// 创建用户验证规则
const createUserSchema = Joi.object({
  name: Joi.string()
    .min(2)
    .max(50)
    .required()
    .messages({
      'string.empty': '姓名不能为空',
      'string.min': '姓名至少2个字符',
      'string.max': '姓名最多50个字符',
      'any.required': '姓名是必填项'
    }),
  
  email: Joi.string()
    .email()
    .required()
    .messages({
      'string.email': '邮箱格式不正确',
      'any.required': '邮箱是必填项'
    }),
  
  age: Joi.number()
    .integer()
    .min(1)
    .max(150)
    .optional()
    .messages({
      'number.min': '年龄必须大于0',
      'number.max': '年龄不能超过150'
    }),
  
  role: Joi.string()
    .valid('admin', 'user', 'guest')
    .default('user')
    .messages({
      'any.only': '角色只能是 admin、user 或 guest'
    }),
  
  password: Joi.string()
    .min(6)
    .max(30)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .required()
    .messages({
      'string.min': '密码至少6个字符',
      'string.max': '密码最多30个字符',
      'string.pattern.base': '密码必须包含大写字母、小写字母和数字',
      'any.required': '密码是必填项'
    })
});

// 更新用户验证规则（所有字段可选）
const updateUserSchema = Joi.object({
  name: Joi.string().min(2).max(50),
  email: Joi.string().email(),
  age: Joi.number().integer().min(1).max(150),
  role: Joi.string().valid('admin', 'user', 'guest')
}).min(1).messages({
  'object.min': '至少需要提供一个字段进行更新'
});

// 查询参数验证
const querySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  sort: Joi.string().valid('name', 'age', 'createdAt').default('createdAt'),
  order: Joi.string().valid('asc', 'desc').default('desc')
});

// ID 参数验证
const idParamSchema = Joi.object({
  id: Joi.number().integer().positive().required().messages({
    'number.positive': 'ID 必须是正整数'
  })
});

module.exports = {
  createUserSchema,
  updateUserSchema,
  querySchema,
  idParamSchema
};

