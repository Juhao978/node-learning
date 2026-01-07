const { sequelize } = require('../config/database');
const User = require('./User');
const Article = require('./Article');
const Comment = require('./Comment');

// 定义关联关系

// 用户 - 文章：一对多
User.hasMany(Article, { foreignKey: 'authorId', as: 'articles' });
Article.belongsTo(User, { foreignKey: 'authorId', as: 'author' });

// 用户 - 评论：一对多
User.hasMany(Comment, { foreignKey: 'userId', as: 'comments' });
Comment.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// 文章 - 评论：一对多
Article.hasMany(Comment, { foreignKey: 'articleId', as: 'comments' });
Comment.belongsTo(Article, { foreignKey: 'articleId', as: 'article' });

// 评论自关联（回复）
Comment.hasMany(Comment, { foreignKey: 'parentId', as: 'replies' });
Comment.belongsTo(Comment, { foreignKey: 'parentId', as: 'parent' });

const syncDatabase = async () => {
  await sequelize.sync({ alter: true });
  console.log('✅ 数据库同步完成');
};

module.exports = {
  sequelize,
  User,
  Article,
  Comment,
  syncDatabase
};

