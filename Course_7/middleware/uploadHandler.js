/**
 * 上传错误处理中间件
 * 
 * multer 的错误需要特殊处理
 */

const multer = require('multer');

const uploadErrorHandler = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    // Multer 错误
    switch (err.code) {
      case 'LIMIT_FILE_SIZE':
        return res.status(400).json({
          error: '文件太大',
          message: '单个文件不能超过 5MB'
        });
      case 'LIMIT_FILE_COUNT':
        return res.status(400).json({
          error: '文件数量超限',
          message: '最多只能上传 5 个文件'
        });
      case 'LIMIT_UNEXPECTED_FILE':
        return res.status(400).json({
          error: '字段名错误',
          message: `未预期的文件字段: ${err.field}`
        });
      default:
        return res.status(400).json({
          error: '上传错误',
          message: err.message
        });
    }
  }
  
  if (err) {
    return res.status(400).json({
      error: '上传失败',
      message: err.message
    });
  }
  
  next();
};

module.exports = uploadErrorHandler;

