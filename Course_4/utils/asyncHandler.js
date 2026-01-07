/**
 * 异步错误处理包装器
 * 
 * 问题：async 函数中的错误不会自动被 Express 错误处理中间件捕获
 * 
 * 原因：Express 4/5 需要显式调用 next(error)
 * 
 * 这个工具函数自动捕获 async 函数中的错误并传递给 next
 * 
 * 前端类比：
 * 就像在 async 函数外包一层 try-catch
 */

const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

module.exports = asyncHandler;

/**
 * 使用方式对比：
 * 
 * ❌ 没有 asyncHandler（需要手动 try-catch）
 * 
 * app.get('/users', async (req, res, next) => {
 *   try {
 *     const users = await User.findAll();
 *     res.json(users);
 *   } catch (error) {
 *     next(error);
 *   }
 * });
 * 
 * ✅ 使用 asyncHandler（自动处理错误）
 * 
 * app.get('/users', asyncHandler(async (req, res) => {
 *   const users = await User.findAll();
 *   res.json(users);
 * }));
 */

