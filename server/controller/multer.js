const multer = require("multer");
const GridFsStorage = require("multer-gridfs-storage").GridFsStorage;

const storage = new GridFsStorage({
  url: "mongodb://localhost/whatsappclone",
  file: (req, file) => {
    return {
      bucketName: "fs",
      filename: `${Date.now()}-blog-${file.originalname}`,
    };
  },
});
const upload = multer({ storage });
module.exports = upload;
