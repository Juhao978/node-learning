/**
 * 模拟用户数据
 * 
 * 在真实项目中，这些数据会存储在数据库中
 * 这里为了学习方便，我们使用内存数组模拟
 * 
 * 注意：服务器重启后，数据会重置
 */
const MockUser = [
  {
    id: 1,
    name: '张三',
    email: 'zhangsan@example.com',
    age: 25,
    role: 'admin'
  },
  {
    id: 2,
    name: '李四',
    email: 'lisi@example.com',
    age: 30,
    role: 'user'
  },
  {
    id: 3,
    name: '王五',
    email: 'wangwu@example.com',
    age: 28,
    role: 'user'
  }
];

module.exports = { MockUser };
