const { uploadBufferToCloudinary } = require('../middlewares/upload');

exports.uploadSingle = async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
    const resourceType = req.query.type === 'video' ? 'video' : 'image';
    const folder = req.query.folder || 'katostore';
    const publicId = req.query.publicId || (req.body && req.body.publicId);
    const overwrite = req.query.overwrite ? String(req.query.overwrite) === 'true' : true;
    const result = await uploadBufferToCloudinary(req.file.buffer, folder, resourceType, { publicId, overwrite });
    return res.status(201).json({
      url: result.secure_url,
      publicId: result.public_id,
      resourceType: result.resource_type,
      width: result.width,
      height: result.height,
      format: result.format,
    });
  } catch (err) {
    next(err);
  }
};

exports.uploadMultiple = async (req, res, next) => {
  try {
    if (!req.files || req.files.length === 0) return res.status(400).json({ message: 'No files uploaded' });
    const resourceType = req.query.type === 'video' ? 'video' : 'image';
    const folder = req.query.folder || 'katostore';
    const overwrite = req.query.overwrite ? String(req.query.overwrite) === 'true' : true;
    // publicIds can be sent as JSON array in body or query (comma-separated)
    let publicIds = [];
    if (req.body && req.body.publicIds) {
      try {
        publicIds = Array.isArray(req.body.publicIds) ? req.body.publicIds : JSON.parse(req.body.publicIds);
      } catch {}
    } else if (req.query.publicIds) {
      publicIds = String(req.query.publicIds).split(',');
    }
    const uploads = await Promise.all(
      req.files.map((f, i) =>
        uploadBufferToCloudinary(f.buffer, folder, resourceType, {
          publicId: publicIds[i] || undefined,
          overwrite,
        })
      )
    );
    return res.status(201).json(
      uploads.map((r) => ({
        url: r.secure_url,
        publicId: r.public_id,
        resourceType: r.resource_type,
        width: r.width,
        height: r.height,
        format: r.format,
      }))
    );
  } catch (err) {
    next(err);
  }
};
