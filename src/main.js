import multer from "multer";
import express from "express";
import fs from "fs";
import { promises as fsp } from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import sharp from "sharp"; // Adding sharp to our toolbox, UwU to that! 💖🎉🔧
import cron from "node-cron";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const app = express();
app.use(express.static(join(__dirname, "public")));

app.use("/uploads", express.static(path.join(__dirname, "../uploads"))); // adds '/uploads' to your list of static file directories

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
    res.redirect("/thank-you");
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

let catOfTheDay = "";

///
async function chooseCatOfTheDay() {
  console.log("Choosing cat of the day! UwU 💖✨🐈");
  try {
    let files = await fsp.readdir("uploads/");
    const statsPromises = files.map(async (file) => {
      const filePath = path.join("uploads/", file);
      const stat = await fsp.stat(filePath);
      return {
        filePath,
        isFile: stat.isFile(),
        isPlaceholder: file.startsWith("_placeholder"), // Here we are changing how we check if it's resized 😸💖👉👈
        isResized: file.startsWith("resized_"),
      };
    });
    const stats = await Promise.all(statsPromises);
    const validFiles = stats.filter(
      (stat) => stat.isFile && !stat.isPlaceholder, // We're not excluding "resized_" images anymore! 🎉🐾
    );
    if (!validFiles.length) {
      return null; // No valid files in the directory, exit the function UwU 👉👈💖
    }
    const randomFile =
      validFiles[Math.floor(Math.random() * validFiles.length)].filePath;
    catOfTheDay = randomFile;
  } catch (err) {
    console.log(
      `Oopsie, an error happened in choosing the cat of the day: ${err}`,
    );
  }
}

chooseCatOfTheDay();
//cron.schedule("0 * * * *", chooseCatOfTheDay);
cron.schedule("* * * * *", chooseCatOfTheDay);

let quotes = [
  "Today is a puur-fect day to be paw-sitive! UwU 🐾✨",
  "Always remembewr to be the purr-son your cat thinks you are! 🐈💖",
  "Keep your tail high, keep your head higher, and always show them your claws. Rawr! 😸✨",
  "Fur every dark night, a bright day of snuggles follows. UwU 🌞💕",
  "The smallest feline is a meow-sterpiece! 😺💖✨",
  "Cuddle up & snuggle on, a new day is paw-sible with a cat by your side! UwU 🐱💖",
];

app.get("/catoftheday", (req, res) => {
  // Heere we're picking a quote at wandom every time this route is accessed. 😻✨👉👈
  let randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
  // Render the 'catoftheday' view and pass it the 'catOfTheDay' filename
  res.render("catoftheday", {
    catOfTheDay: catOfTheDay,
    randomQuote: randomQuote,
  });
});

app.get("/thank-you", (req, res) => {
  // Render the 'catoftheday' view and pass it the 'catOfTheDay' filename
  res.render("thank-you");
});
