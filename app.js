const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const { OpenAI } = require("openai");
require("dotenv").config({ path: ".env" });

const auth = require("./Middleware/Auth");
const User = require("./Models/User.js");
const Todo = require("./Models/ToDo.js");
var bcrypt = require("bcryptjs");
var jwt = require("jsonwebtoken");

const app = express();
const port = 5000;
app.use(cors());
app.use(bodyParser.json({ limit: "50mb" }));
app.use(
  bodyParser.urlencoded({
    limit: "50mb",
    extended: true,
    parameterLimit: 100000000,
  })
);
const openai = new OpenAI({
  apiKey: process.env.KEY,
});

const url = process.env.DB;

mongoose.connect(
  url,
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
    useCreateIndex: true,
  },
  (err) => {
    if (err) {
      throw err;
    }
    console.log("Mongoose ile bağlantı kuruldu.");
  }
);
app.get("/", (req, res) => {
  res.json("Hello World!");
});

app.post("/adduser", async (req, res) => {
  const { values } = req.body;
  const salt = await bcrypt.genSalt();
  const passwordHash = await bcrypt.hash(values.password, salt);
  if (!values.name || !values.password || !values.eMail || !values.username) {
    res.status(400);
    return res.json({ hata: "All blanks must be filled." });
  } else {
    User.create({
      eMail: values.eMail,
      password: passwordHash,
      name: values.name,
      username: values.username,
    });
  }

  res.json("Succeeded");
});
app.post("/additem", async (req, res) => {
  const { values, image, ownerID } = req.body;
  const completion = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "user",
        content:
          "Sana bir ToDo listin göreviyle ilgili bilgiler geliyor. Görevin başlığı:" +
          values.headline +
          "Görevin açıklaması." +
          values.description +
          "Bu bilgiler ile göreve dair kullanıcıya öneri ve içgörü üretmeni istiyorum.(Maksimum 3 cümle)",
      },
    ],
  });

  if (!values.headline || !values.description || !image) {
    res.status(400);
    return res.json({ hata: "All blanks must be filled." });
  } else {
    Todo.create({
      headline: values.headline,
      description: values.description,
      image: image,
      ownerID,
      chatGPT: completion.choices[0].message.content,
    });
  }

  res.json("Succeeded");
});

app.post("/Login", async (req, res) => {
  const { values } = req.body;
  if (!values.username || !values.password) {
    res.status(400);
    return res.json({ hata: "All blanks must be filled." });
  }
  const username = values.username;
  const user = await User.findOne({ username });
  if (!user) {
    res.status(400);
    return res.json({ hata: "Wrong username." });
  }
  const isMatch = await bcrypt.compare(values.password, user.password);
  if (!isMatch) {
    res.status(400);
    return res.json({ hata: "Wrong Password." });
  }
  const token = jwt.sign({ id: user._id }, "melih");

  res.json({
    token,
    user,
  });
});

app.post("/loggedIn", async (req, res) => {
  try {
    const token = req.header("x-auth-token");

    if (!token) return res.json(false);

    jwt.verify(token, "melih");

    res.send(true);
  } catch (err) {
    res.json(false);
  }
});

app.get("/log", auth, async (req, res) => {
  const user = await User.findById(req.user);

  res.json({
    user,
  });
});

app.post("/getitems", async (req, res) => {
  const { id } = req.body;

  const items = await Todo.find({ ownerID: id });
  let newItems = [];
  items.map((item) => {
    newItems.push({
      _id: item._id,
      ownerID: item.ownerID,
      headline: item.headline,
      description: item.description,
      chatGPT: item.chatGPT,
      image: item.image.toString(),
    });
  });
  res.json(newItems);
});
app.post("/findtodo", async (req, res) => {
  const { id } = req.body;

  let todo = await Todo.findById(id);

  if (todo) {
    res.json(todo);
  } else {
    res.status(400);
    res.json({
      ErrorType: "todoDontExist",
      ErrorMessage: "There is no todo with that name.",
    });
  }
});
app.post("/edittodo", async (req, res) => {
  const { values, id } = req.body;
  const todo = await Todo.findById(id);
  const completion = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "user",
        content:
          "Sana bir ToDo listin göreviyle ilgili bilgiler geliyor. Görevin başlığı:" +
          values.headline +
          "Görevin açıklaması." +
          values.description +
          "Bu bilgiler ile göreve dair kullanıcıya öneri ve içgörü üretmeni istiyorum.(Maksimum 3 cümle)",
      },
    ],
  });
  await Todo.findByIdAndUpdate(todo._id, {
    headline: values.headline,
    description: values.description,
    chatGPT: completion.choices[0].message.content,
  });
  res.json({ success: true });
});
app.post("/deleteitem", async (req, res) => {
  const { id } = req.body;

  await Todo.findByIdAndDelete(id);
  res.json({ success: true });
});
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
