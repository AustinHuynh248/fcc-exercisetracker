const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    require: true,
  },
});

const exerciseUser = new mongoose.model("ExerciseUser", userSchema);

const createANewUser = async (name) => {
  const newUser = await exerciseUser.create({ username: name });
  return newUser;
};

const findUserById = async (id) => {
  const user = await exerciseUser.findById(id);
  return user;
};

const getAllUser = async () => {
  const users = await exerciseUser.find({});
  return users;
};

module.exports = {
  findUserById,
  getAllUser,
  createANewUser,
};
