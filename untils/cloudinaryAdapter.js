const cloudinary = require('cloudinary').v2;
const CloudStorage = require('./cloudStorage');

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET
});

class CloudinaryAdapter extends CloudStorage {
  async upload(path) {
    return new Promise((resolve, reject) => {
      cloudinary.uploader.upload(path, { resource_type: "auto" }, (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result.secure_url);
        }
      });
    });
  }
}

module.exports = CloudinaryAdapter;