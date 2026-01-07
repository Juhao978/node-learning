const { Article, User, Comment } = require('../models');

const getArticles = async (req, res) => {
  try {
    const { page = 1, limit = 10, status = 'published' } = req.query;
    
    const { count, rows } = await Article.findAndCountAll({
      where: { status },
      include: [{
        model: User,
        as: 'author',
        attributes: ['id', 'username', 'avatar']
      }],
      order: [['created_at', 'DESC']],
      limit: parseInt(limit),
      offset: (parseInt(page) - 1) * parseInt(limit)
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

const getArticleById = async (req, res) => {
  try {
    const article = await Article.findByPk(req.params.id, {
      include: [
        {
          model: User,
          as: 'author',
          attributes: ['id', 'username', 'avatar', 'bio']
        },
        {
          model: Comment,
          as: 'comments',
          include: [{
            model: User,
            as: 'user',
            attributes: ['id', 'username', 'avatar']
          }],
          where: { parentId: null },
          required: false,
          limit: 10,
          order: [['created_at', 'DESC']]
        }
      ]
    });
    
    if (!article) {
      return res.status(404).json({ error: '文章不存在' });
    }
    
    // 增加阅读量
    article.viewCount += 1;
    await article.save();
    
    res.json(article);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const createArticle = async (req, res) => {
  try {
    const { title, content, summary, cover, status } = req.body;
    
    if (!title || !content) {
      return res.status(400).json({ error: '标题和内容不能为空' });
    }
    
    const article = await Article.create({
      title,
      content,
      summary: summary || content.substring(0, 200),
      cover,
      status: status || 'draft',
      authorId: req.userId
    });
    
    res.status(201).json(article);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updateArticle = async (req, res) => {
  try {
    const article = await Article.findByPk(req.params.id);
    
    if (!article) {
      return res.status(404).json({ error: '文章不存在' });
    }
    
    // 检查权限
    if (article.authorId !== req.userId && req.user.role !== 'admin') {
      return res.status(403).json({ error: '无权修改此文章' });
    }
    
    const { title, content, summary, cover, status } = req.body;
    
    if (title) article.title = title;
    if (content) article.content = content;
    if (summary) article.summary = summary;
    if (cover !== undefined) article.cover = cover;
    if (status) article.status = status;
    
    await article.save();
    res.json(article);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const deleteArticle = async (req, res) => {
  try {
    const article = await Article.findByPk(req.params.id);
    
    if (!article) {
      return res.status(404).json({ error: '文章不存在' });
    }
    
    if (article.authorId !== req.userId && req.user.role !== 'admin') {
      return res.status(403).json({ error: '无权删除此文章' });
    }
    
    await article.destroy();
    res.json({ message: '删除成功' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getMyArticles = async (req, res) => {
  try {
    const articles = await Article.findAll({
      where: { authorId: req.userId },
      order: [['created_at', 'DESC']]
    });
    res.json(articles);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getArticles,
  getArticleById,
  createArticle,
  updateArticle,
  deleteArticle,
  getMyArticles
};

