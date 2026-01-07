/**
 * User 模型
 */

let users = [
  { id: 1, name: '张三', email: 'zhangsan@example.com', age: 25, role: 'admin', password: 'hashed' },
  { id: 2, name: '李四', email: 'lisi@example.com', age: 30, role: 'user', password: 'hashed' },
  { id: 3, name: '王五', email: 'wangwu@example.com', age: 28, role: 'user', password: 'hashed' }
];

let nextId = 4;

const findAll = () => users.map(u => ({ ...u, password: undefined }));

const findById = (id) => {
  const user = users.find(u => u.id === id);
  if (!user) return null;
  return { ...user, password: undefined };
};

const findByEmail = (email) => users.find(u => u.email === email);

const create = (data) => {
  const newUser = { id: nextId++, ...data };
  users.push(newUser);
  return { ...newUser, password: undefined };
};

const update = (id, data) => {
  const index = users.findIndex(u => u.id === id);
  if (index === -1) return null;
  users[index] = { ...users[index], ...data };
  return { ...users[index], password: undefined };
};

const remove = (id) => {
  const index = users.findIndex(u => u.id === id);
  if (index === -1) return false;
  users.splice(index, 1);
  return true;
};

module.exports = { findAll, findById, findByEmail, create, update, remove };

