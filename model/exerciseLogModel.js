const mongoose = require("mongoose");

const exerciseSchema = new mongoose.Schema({
  username: {
    type: String,
    require: true,
  },
  count: {
    type: Number,
  },
  log: [
    {
      description: {
        type: String,
      },
      duration: {
        type: Number,
      },
      date: {
        type: Date,
      },
    },
  ],
});

const exerciseLog = mongoose.model("ExerciseLog", exerciseSchema);

const createANewUser = async (name) => {
  const newUser = await exerciseLog.create({ username: name });
  return newUser;
};

const findUserById = async (id) => {
  const exerciseLogId = await exerciseLog.findById(id);
  return exerciseLogId;
};

// Use elemMatch to query array values or dot operation
const findUserByCondition = async (id) => {
  // Ex:
  // log: { $elemMatch: { date: { $gte: "2022-09-01" } } },
  const exerciseLogId = await exerciseLog.findOne({
    _id: id,
  });
  return exerciseLogId;
};

const getAllUser = async () => {
  const users = await exerciseLog.find({}).select({ username: 1 }).exec();
  return users;
};

const updateUserExerciseLog = async (id, data) => {
  const newUpdateData = await exerciseLog.findOneAndUpdate({ _id: id }, data, {
    new: true,
  });
  return newUpdateData;
};

module.exports = {
  createANewUser,
  findUserById,
  findUserByCondition,
  updateUserExerciseLog,
  getAllUser,
};
