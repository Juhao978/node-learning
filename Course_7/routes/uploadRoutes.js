const express = require('express');
const router = express.Router();
const { singleUpload, multipleUpload, fieldsUpload } = require('../config/upload');
const uploadController = require('../controllers/uploadController');
const uploadErrorHandler = require('../middleware/uploadHandler');

// 单文件上传
router.post('/',
  singleUpload,
  uploadErrorHandler,
  uploadController.uploadSingle
);

// 多文件上传
router.post('/multiple',
  multipleUpload,
  uploadErrorHandler,
  uploadController.uploadMultiple
);

// 多字段上传
router.post('/fields',
  fieldsUpload,
  uploadErrorHandler,
  uploadController.uploadFields
);

// 获取文件列表
router.get('/files', uploadController.getFiles);

// 删除文件
router.delete('/files/:type/:filename', uploadController.deleteFile);

module.exports = router;

