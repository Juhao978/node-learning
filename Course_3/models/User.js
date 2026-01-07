/**
 * User 模型 - MVC 中的 Model 层
 * 
 * 职责：数据的存储和操作逻辑
 * 在真实项目中，这里会连接数据库
 * 现在我们用内存数组模拟
 */

// 模拟数据库
let users = [
  { id: 1, name: '张三', email: 'zhangsan@example.com', age: 25, role: 'admin' },
  { id: 2, name: '李四', email: 'lisi@example.com', age: 30, role: 'user' },
  { id: 3, name: '王五', email: 'wangwu@example.com', age: 28, role: 'user' }
];

// 自增 ID
let nextId = 4;

/**
 * 获取所有用户
 */
const findAll = () => {
  return users;
};

/**
 * 根据 ID 查找用户
 */
const findById = (id) => {
  return users.find(user => user.id === id);
};

/**
 * 创建用户
 */
const create = (userData) => {
  const newUser = {
    id: nextId++,
    ...userData
  };
  users.push(newUser);
  return newUser;
};

/**
 * 更新用户
 */
const update = (id, userData) => {
  const index = users.findIndex(user => user.id === id);
  if (index === -1) return null;
  
  users[index] = { ...users[index], ...userData };
  return users[index];
};

/**
 * 删除用户
 */
const remove = (id) => {
  const index = users.findIndex(user => user.id === id);
  if (index === -1) return false;
  
  users.splice(index, 1);
  return true;
};

module.exports = {
  findAll,
  findById,
  create,
  update,
  remove
};

