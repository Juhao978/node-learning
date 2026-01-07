const { Comment, User, Article } = require('../models');

const getComments = async (req, res) => {
  try {
    const { articleId } = req.params;
    
    const comments = await Comment.findAll({
      where: { articleId, parentId: null },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'username', 'avatar']
        },
        {
          model: Comment,
          as: 'replies',
          include: [{
            model: User,
            as: 'user',
            attributes: ['id', 'username', 'avatar']
          }]
        }
      ],
      order: [['created_at', 'DESC']]
    });
    
    res.json(comments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const createComment = async (req, res) => {
  try {
    const { articleId } = req.params;
    const { content, parentId } = req.body;
    
    if (!content) {
      return res.status(400).json({ error: '评论内容不能为空' });
    }
    
    // 检查文章是否存在
    const article = await Article.findByPk(articleId);
    if (!article) {
      return res.status(404).json({ error: '文章不存在' });
    }
    
    const comment = await Comment.create({
      content,
      articleId,
      userId: req.userId,
      parentId: parentId || null
    });
    
    // 获取完整评论信息
    const fullComment = await Comment.findByPk(comment.id, {
      include: [{
        model: User,
        as: 'user',
        attributes: ['id', 'username', 'avatar']
      }]
    });
    
    res.status(201).json(fullComment);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const deleteComment = async (req, res) => {
  try {
    const comment = await Comment.findByPk(req.params.id);
    
    if (!comment) {
      return res.status(404).json({ error: '评论不存在' });
    }
    
    if (comment.userId !== req.userId && req.user.role !== 'admin') {
      return res.status(403).json({ error: '无权删除此评论' });
    }
    
    await comment.destroy();
    res.json({ message: '删除成功' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { getComments, createComment, deleteComment };

