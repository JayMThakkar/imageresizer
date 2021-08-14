const express = require('express')

const multer = require('multer')

const imageSize = require('image-size')

const sharp = require('sharp')

var outputFilePath

var width 

var height

var format

const bodyParser = require("body-parser");

const fs = require('fs')

const path = require('path')

var dir = "public";
var subDirectory = "public/uploads";

if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir);

  fs.mkdirSync(subDirectory);
}

const app = express()

app.use(bodyParser.urlencoded({extended:false}))
app.use(bodyParser.json())
app.use(express.static("public"));


//For uploading image with multer
var storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, "public/uploads");
    },
    filename: function (req, file, cb) {
      cb(
        null,
        file.fieldname + "-" + Date.now() + path.extname(file.originalname)
      );
    },
  });
  
  const imageFilter = function (req, file, cb) {
    if (
      file.mimetype == "image/png" ||
      file.mimetype == "image/jpg" ||
      file.mimetype == "image/jpeg"
    ) {
      cb(null, true);
    } else {
      cb(null, false);
      return cb(new Error("Only .png, .jpg and .jpeg format allowed!"));
    }
  };
  
  var upload = multer({ storage: storage, fileFilter: imageFilter });

const PORT = process.env.PORT || 3000

app.get('/', (req,res) => {
    res.sendFile(__dirname + "/index.html")
})

function processImage(width, height, req, res) {
  outputFilePath = Date.now() + "output." + format;
  if (req.file) {
    sharp(req.file.path)
      .resize(width, height)
      .toFile(outputFilePath, (err, info) => {
        if (err) throw err;
        res.download(outputFilePath, (err) => {
          if (err) throw err;
          fs.unlinkSync(req.file.path);
          fs.unlinkSync(outputFilePath);
        });
      });
  }
}

app.post('/processimage',upload.single('file'),(req, res) => {
  format = req.body.format;

  width = parseInt(req.body.width);
  height = parseInt(req.body.height);

  console.log(width);
  console.log(height);

  if (isNaN(width) || isNaN(height)) {
    dimensions = imageSize(req.file.path);
    width = parseInt(dimensions.width);
    height = parseInt(dimensions.height);
    processImage(width, height, req, res);
  } else {
    processImage(width, height, req, res);
  }
})

app.listen(PORT, () => {
    console.log(`App is listening at port ${PORT}`)
})