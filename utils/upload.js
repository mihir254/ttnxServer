const multer = require('multer');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "./public/images");
    },
    filename: (req, file, cb) => {
        cb(null, new Date().toISOString().replace(/:/g, '-') + file.originalname);
    }
});

const filter = (req, file, cb) => {
    if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
        cb(null, true);
    }
    else {
        cb(new Error("Unsupported file type"), false);
    }
}

exports.upload = multer({
    storage: storage,
    fileFilter: filter
});


exports.getURLSingle = (req) => {
    const fileURL = req.protocol + '://' + req.get('host') + "/" + req.file.path;
    return fileURL;
}

exports.getURLMultiple = (req) => {
    const files = req.files;
    const urls = []
    files.forEach(file => {
        urls.push(req.protocol + '://' + req.get('host') + "/" + file.path);
    });
    return urls;
}