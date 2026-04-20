import multer from "multer";
import express from "express";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const app = express();
app.use(express.static(join(__dirname, "public")));
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});
const upload = multer({ storage: storage });
app.post("/submit", upload.single("kitty"), (req, res, next) => {
  // req.file is the 'kitty' file // req.body will hold the text fields, if there were any
  console.log(req.file);
  res.redirect("/");
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
app.listen(3000, () => {
  console.log("Cutesy-Cat-Of-The-Day app listening on port 3000! UwU");
});
