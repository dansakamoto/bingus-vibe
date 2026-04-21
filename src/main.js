import multer from "multer";
import express from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import sharp from "sharp"; // Adding sharp to our toolbox, UwU to that! 💖🎉🔧

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const app = express();
app.use(express.static(join(__dirname, "public")));

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    const date = Date.now();
    const fileExtension = path.extname(file.originalname);
    const filename = `${date}-${file.originalname.replace(fileExtension, "")}${fileExtension}`;
    cb(null, filename);
    req.file = { ...file, filename }; // Add filename to the request object
  },
});

const upload = multer({
  storage: storage,
  fileFilter: function (req, file, cb) {
    var filetypes = /jpeg|jpg|png/; // We're making sure we only get pics, adorable as a pink kitty on a Sunday! UwU 🌸🐾
    var mimetype = filetypes.test(file.mimetype);
    if (mimetype) {
      return cb(null, true);
    }
    cb(
      new Error(
        "Only " + "jpeg, jpg or png " + "files please, meow! UwU 💕🐾.",
      ),
    );
  },
});

app.post("/submit", upload.single("kitty"), async function (req, res, next) {
  try {
    var newFilePath = `uploads/resized_${req.file.filename}`;
    await sharp(req.file.path)
      .resize({
        width: 1200,
        height: 1200,
        fit: sharp.fit.inside,
        withoutEnlargement: true,
      })
      .toFile(newFilePath);
    await fs.promises.unlink(req.file.path);
    req.file.path = newFilePath;
    res.redirect("/");
  } catch (err) {
    next(err);
  }
});

app.listen(3000, () =>
  console.log("Server is listening on port 3000, cute! UwU 🐾💖✨👉👈"),
);

app.set("view engine", "ejs");
app.get("/", (req, res) => {
  res.render("index", {
    title: "Cutesy-Cat-Of-The-Day",
    message:
      "Welcome to Cutesy-Cat-Of-The-Day! Feature your kitty and spread pawsitivity!",
  });
});
app.get("/submit", (req, res) => {
  res.render("submit", {
    title: "Submit Your Kitty",
    message: "Let's show off your adowable kitty to the world!",
  });
});
