const express = require('express');
const router = express.Router();
const articleController = require('../controllers/articleController');
const commentController = require('../controllers/commentController');
const { authenticate, optionalAuth } = require('../middleware/auth');

// 公开接口
router.get('/', articleController.getArticles);
router.get('/:id', optionalAuth, articleController.getArticleById);

// 需要认证
router.post('/', authenticate, articleController.createArticle);
router.put('/:id', authenticate, articleController.updateArticle);
router.delete('/:id', authenticate, articleController.deleteArticle);
router.get('/user/my', authenticate, articleController.getMyArticles);

// 评论
router.get('/:articleId/comments', commentController.getComments);
router.post('/:articleId/comments', authenticate, commentController.createComment);
router.delete('/comments/:id', authenticate, commentController.deleteComment);

module.exports = router;

