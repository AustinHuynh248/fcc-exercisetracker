const express = require("express");
const app = express();
const mongoose = require("mongoose");
const exerciseLog = require("./model/exerciseLogModel");
const exerciseUser = require("./model/userModel");
const bodyParser = require("body-parser");
const cors = require("cors");
require("dotenv").config();

// Connect to the db
try {
  mongoose.connect(process.env.MONGO_URI);
  console.log("DB connected successfully");
} catch (error) {
  console.log(error);
}

app.use(cors());
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/views/index.html");
});

app.post("/", (req, res) => {
  console.log(req.body);
});

// Create a new user
app.post("/api/users", async (req, res) => {
  const userName = req.body.username;
  const newUser = await exerciseUser.createANewUser(userName);
  return res.json({ username: newUser.username, _id: newUser._id });
});

// Create a new user
app.get("/api/users", async (req, res) => {
  const users = await exerciseUser.getAllUser();
  return res.json(users);
});

// See all the user id logs
app.get("/api/users/:_id?/logs", async (req, res) => {
  const id = req.params._id;
  // Object id format for mongoid
  const regex = new RegExp("^[0-9a-fA-F]{24}$");
  if (!regex.test(id))
    return res.json({ sucess: false, error: "Invalid User Id" });

  let { from, to, limit } = req.query;

  const user = await exerciseUser.findUserById(id);

  if (!user)
    return res.json({
      sucess: false,
      error: "User Id not exist, please create a new user",
    });

  from = from ?? false;
  to = to ?? false;
  limit = limit ?? 0;

  const logs = await exerciseLog.findLogsByDateRange(
    user._id.toString(),
    from,
    to,
    limit
  );

  const displayLogs = [];
  logs.forEach((element, index) => {
    displayLogs.push({
      _id: element.id,
      userId: element.userId,
      description: element.description,
      duration: element.duration,
      date: element.date.toDateString(),
    });
  });

  let displayData = {
    _id: user._id,
    username: user.username,
    count: logs.length,
    log: displayLogs,
  };

  return res.json(displayData);
});

// Create a exercises log
app.post("/api/users/:_id?/exercises", async (req, res) => {
  const id = req.params._id;
  // Object id format for mongoid
  const regex = new RegExp("^[0-9a-fA-F]{24}$");
  if (!regex.test(id))
    return res.json({ sucess: false, error: "Invalid User Id" });

  const user = await exerciseUser.findUserById(id);

  if (!user)
    return res.json({
      sucess: false,
      error: "User Id not exist, please create a new user",
    });

  const exerciseDate = req.body.date ? new Date(req.body.date) : new Date();
  const exerciseDescription = req.body.description;
  const exerciseDuration = Number(req.body.duration);

  // Creating exercise log
  const newExerciseLogged = await exerciseLog.createNewExerciseLog({
    userId: user._id,
    description: exerciseDescription,
    duration: exerciseDuration,
    date: exerciseDate,
  });

  // Display data
  return res.json({
    _id: newExerciseLogged.userId,
    username: user.username,
    date: newExerciseLogged.date.toDateString(),
    duration: newExerciseLogged.duration,
    description: newExerciseLogged.description,
  });
});

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log("Your app is listening on port " + listener.address().port);
});
