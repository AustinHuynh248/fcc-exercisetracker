const mongoose = require("mongoose");

const exerciseSchema = new mongoose.Schema({
  userId: {
    type: String,
  },
  description: {
    type: String,
  },
  duration: {
    type: Number,
  },
  date: {
    type: Date,
  },
});

const exerciseLog = mongoose.model("ExerciseLog", exerciseSchema);

const findLogsByUserId = async (id) => {
  const exerciseLog = await exerciseLog.find({ userId: id });
  return exerciseLog;
};

const findLogsByDateRange = async (id, from = false, to = false, limit = 0) => {
  const condition = { userId: id };
  if (from || to) condition.date = {};
  if (from) condition.date.$gte = from;
  if (to) condition.date.$lt = to;

  const logs = await exerciseLog.find(condition).limit(limit).exec();

  return logs;
};

const createNewExerciseLog = async (data) => {
  const newUpdateData = await exerciseLog.create(data);
  return newUpdateData;
};

module.exports = {
  createNewExerciseLog,
  findLogsByUserId,
  findLogsByDateRange,
};
