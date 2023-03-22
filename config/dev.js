module.exports = {
  googleClientID:
    '70265989829-0t7m7ce5crs6scqd3t0t6g7pv83ncaii.apps.googleusercontent.com',
  googleClientSecret: '8mkniDQOqacXtlRD3gA4n2az',
  mongoURI: process.env.MONGO_URI,
  // this is the secret key used to encrypt the cookie
  cookieKey: '123123123',
  redisUrl: 'redis://127.0.0.1:6379',
  accessKeyId: process.env.ACCESS_KEY_ID,
  secretAccessKey: process.env.SECRET_ACCESS_KEY
};
