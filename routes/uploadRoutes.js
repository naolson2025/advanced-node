const AWS = require('aws-sdk');
const keys = require('../config/keys');
const uuid = require('uuid/v1');
const requireLogin = require('../middlewares/requireLogin');

const s3 = new AWS.S3({
  accessKeyId: keys.accessKeyId,
  secretAccessKey: keys.secretAccessKey,
  region: 'us-east-2',
});

// logic for getting the presigned url from s3
module.exports = (app) => {
  app.get('/api/upload', requireLogin, (req, res) => {
    // each user id will have a unique folder in s3
    // use uuid to create a unique file name
    const key = `${req.user.id}/${uuid()}.jpeg`;
    // putObject is the action we want to perform, meaning we want to upload a file to s3
    s3.getSignedUrl(
      'putObject',
      {
        Bucket: 'nao-advanced-node',
        ContentType: 'image/jpeg',
        // key is the name of the file
        Key: key,
      },
      (err, url) => res.send({ key, url })
    );
  });
}