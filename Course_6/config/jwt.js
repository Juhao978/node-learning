/**
 * JWT 配置
 * 
 * JWT (JSON Web Token) 是一种开放标准 (RFC 7519)
 * 用于在各方之间安全地传输信息
 * 
 * 结构：header.payload.signature
 * 
 * 前端类比：
 * - JWT 就像登录后存储在 localStorage 的 token
 * - 每次请求都带上这个 token 证明身份
 */

module.exports = {
  // 密钥（生产环境应使用环境变量）
  secret: 'your-super-secret-key-change-in-production',
  
  // 访问令牌过期时间
  accessTokenExpiry: '1h',  // 1小时
  
  // 刷新令牌过期时间
  refreshTokenExpiry: '7d'  // 7天
};

