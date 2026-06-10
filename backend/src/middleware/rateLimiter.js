const loginLimitStore = new Map();

// Periodic cleanup to avoid memory leaks
setInterval(() => {
  const now = Date.now();
  for (const [ip, data] of loginLimitStore.entries()) {
    if (now > data.resetTime) {
      loginLimitStore.delete(ip);
    }
  }
}, 5 * 60 * 1000); // Clean up every 5 minutes

exports.loginRateLimiter = (req, res, next) => {
  const ip = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress;
  const now = Date.now();
  const windowMs = 60 * 1000; // 1 minute window
  const limit = 10;

  let requestData = loginLimitStore.get(ip);

  // If no entry exists or the window has expired, reset
  if (!requestData || now > requestData.resetTime) {
    requestData = {
      count: 1,
      resetTime: now + windowMs
    };
    loginLimitStore.set(ip, requestData);

    res.setHeader('X-RateLimit-Limit', limit);
    res.setHeader('X-RateLimit-Remaining', limit - 1);
    res.setHeader('X-RateLimit-Reset', new Date(requestData.resetTime).toISOString());

    return next();
  }

  requestData.count += 1;
  const remaining = Math.max(0, limit - requestData.count);

  res.setHeader('X-RateLimit-Limit', limit);
  res.setHeader('X-RateLimit-Remaining', remaining);
  res.setHeader('X-RateLimit-Reset', new Date(requestData.resetTime).toISOString());

  if (requestData.count > limit) {
    const secondsLeft = Math.ceil((requestData.resetTime - now) / 1000);
    res.setHeader('Retry-After', secondsLeft);
    return res.status(429).json({
      message: `Too many login attempts. Please try again in ${secondsLeft} seconds.`
    });
  }

  next();
};
