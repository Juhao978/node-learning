/**
 * 全局错误处理中间件
 * 
 * 统一处理所有错误，返回一致的错误格式
 */

const errorHandler = (err, req, res, next) => {
  // 默认值
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';
  
  // 开发环境：返回详细错误信息
  if (process.env.NODE_ENV === 'development') {
    return res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
      error: err,
      stack: err.stack
    });
  }
  
  // 生产环境：隐藏内部错误细节
  if (err.isOperational) {
    // 可预期的操作错误，返回错误信息
    return res.status(err.statusCode).json({
      status: err.status,
      message: err.message
    });
  }
  
  // 未知错误，记录日志并返回通用消息
  console.error('ERROR 💥', err);
  return res.status(500).json({
    status: 'error',
    message: '服务器内部错误'
  });
};

module.exports = errorHandler;

