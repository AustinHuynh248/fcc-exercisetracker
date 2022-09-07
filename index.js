const express = require("express");
const app = express();
const mongoose = require("mongoose");
const exerciseLog = require("./model/exerciseLogModel");
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
  const newUser = await exerciseLog.createANewUser(userName);
  return res.json({ username: newUser.username, _id: newUser._id });
});

// Create a new user
app.get("/api/users", async (req, res) => {
  const users = await exerciseLog.getAllUser();
  return res.json(users);
});

// See all the user id logs
app.get("/api/users/:_id?/logs", async (req, res) => {
  const id = req.params._id;
  // Object id format for mongoid
  const regex = new RegExp("^[0-9a-fA-F]{24}$");
  if (!regex.test(id))
    return res.json({ sucess: false, error: "Invalid User Id" });

  let from = req.query.from ?? "2022-01-01";
  let to = req.query.to ?? "2022-12-10";
  let limit = req.query.limit ?? 100;
  console.log(from, to, limit);

  const user = await exerciseLog.findUserByCondition(id);
  console.log(user);
  if (!user)
    return res.json({
      sucess: false,
      error: "User Id not exist, please create a new user",
    });
  const formatedLog = [];
  user.log.forEach((element, index) => {
    const date = formatDate(element.date);
    console.log(typeof element.date == "object", date >= from, date < to);
    if (typeof element.date == "object" && date >= from && date < to) {
      formatedLog.push({
        description: element.description,
        duration: element.duration,
        date: element.date.toDateString(),
      });
    }
  });

  if (formatedLog.length > limit) formatedLog.length = limit;

  let displayData = {
    _id: user._id,
    username: user.username,
    count: formatedLog.length,
    log: formatedLog,
  };

  let keyValues = Object.entries(displayData);
  from = new Date(from);
  to = new Date(to);

  // Display the params to the res if available
  if (req.query.from) keyValues.splice(2, 0, ["from", from.toDateString()]);
  if (req.query.to) keyValues.splice(3, 0, ["to", to.toDateString()]);
  displayData = Object.fromEntries(keyValues);
  return res.json(displayData);
});

// Create a exercises log
app.post("/api/users/:_id?/exercises", async (req, res) => {
  const id = req.params._id;
  // Object id format for mongoid
  const regex = new RegExp("^[0-9a-fA-F]{24}$");
  if (!regex.test(id))
    return res.json({ sucess: false, error: "Invalid User Id" });

  const user = await exerciseLog.findUserById(id);
  if (!user)
    return res.json({
      sucess: false,
      error: "User Id not exist, please create a new user",
    });

  const exerciseDate = req.body.date ? new Date(req.body.date) : new Date();
  const exerciseDescription = req.body.description;
  const exerciseDuration = Number(req.body.duration);
  user.log.push({
    description: exerciseDescription,
    duration: exerciseDuration,
    date: exerciseDate.toDateString(),
  });

  const updateData = {
    count: user.log.length,
    log: user.log,
  };

  // Updating the data
  const updatedData = await exerciseLog.updateUserExerciseLog(
    user._id,
    updateData
  );

  const formatedDate = exerciseDate.toDateString();
  console.log(formatedDate);
  // Display data
  return res.json({
    _id: updatedData._id,
    username: updatedData.username,
    date: formatedDate,
    duration: exerciseDuration,
    description: exerciseDescription,
  });
});

const formatDate = (date) => {
  let d = new Date(date);
  let month = (d.getMonth() + 1).toString();
  let day = d.getDate().toString();
  let year = d.getFullYear();
  if (month.length < 2) {
    month = "0" + month;
  }
  if (day.length < 2) {
    day = "0" + day;
  }
  return [year, month, day].join("-");
};

console.log(formatDate("Febuary 1, 2021"));
const listener = app.listen(process.env.PORT || 3000, () => {
  console.log("Your app is listening on port " + listener.address().port);
});
