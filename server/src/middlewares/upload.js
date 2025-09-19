const multer = require('multer');
const streamifier = require('streamifier');
const cloudinary = require('../config/cloudinary');

const storage = multer.memoryStorage();
const upload = multer({ storage });

async function uploadBufferToCloudinary(
  buffer,
  folder = 'katostore',
  resourceType = 'image',
  options = {}
) {
  return new Promise((resolve, reject) => {
    const { publicId, overwrite } = options || {};
    const uploadOptions = {
      folder,
      resource_type: resourceType,
      overwrite: typeof overwrite === 'boolean' ? overwrite : true,
    };
    if (publicId) uploadOptions.public_id = publicId;

    const stream = cloudinary.uploader.upload_stream(
      uploadOptions,
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );
    streamifier.createReadStream(buffer).pipe(stream);
  });
}

module.exports = { upload, uploadBufferToCloudinary };
