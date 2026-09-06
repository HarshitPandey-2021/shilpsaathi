import multer from 'multer';

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const ALLOWED_AUDIO_TYPES = [
  'audio/webm',
  'audio/wav',
  'audio/x-wav',
  'audio/mpeg',
  'audio/mp3',
  'audio/ogg',
  'audio/m4a',
  'audio/mp4',
  'audio/aac',
  'application/octet-stream'
];
const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25 MB

const storage = multer.memoryStorage();

function imageFilter(req, file, cb) {
  if (ALLOWED_IMAGE_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`Invalid image type. Allowed: ${ALLOWED_IMAGE_TYPES.join(', ')}`), false);
  }
}

function audioFilter(req, file, cb) {
  if (ALLOWED_AUDIO_TYPES.includes(file.mimetype) || file.mimetype.startsWith('audio/')) {
    cb(null, true);
  } else {
    cb(null, true); // Permissive for mobile recorder codecs
  }
}

const imageUpload = multer({
  storage,
  fileFilter: imageFilter,
  limits: { fileSize: MAX_FILE_SIZE, files: 1 },
});

const audioUpload = multer({
  storage,
  fileFilter: audioFilter,
  limits: { fileSize: MAX_FILE_SIZE, files: 1 },
});

export const uploadSingleImage = imageUpload.single('image');
export const uploadSingleAudio = audioUpload.single('audio');

export function handleUploadError(err, req, res, next) {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(413).json({
        success: false,
        message: 'File too large. Maximum size is 25 MB.',
      });
    }
    return res.status(400).json({
      success: false,
      message: `Upload error: ${err.message}`,
    });
  }
  if (err) {
    return res.status(400).json({
      success: false,
      message: err.message,
    });
  }
  next();
}

export { ALLOWED_IMAGE_TYPES, ALLOWED_AUDIO_TYPES, MAX_FILE_SIZE as MAX_IMAGE_SIZE };

