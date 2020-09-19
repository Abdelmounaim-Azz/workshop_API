const mongoose = require("mongoose");

const ProgramSchema = new mongoose.Schema({
  title: {
    type: String,
    trim: true,
    required: [true, "Please add a Porgram title"],
  },
  description: {
    type: String,
    required: [true, "Please add a description"],
  },
  weeks: {
    type: String,
    required: [true, "Please add number of weeks"],
  },
  tuition: {
    type: Number,
    required: [true, "Please add a tuition cost"],
  },
  minimumSkill: {
    type: String,
    required: [true, "Please add a minimum skill"],
    enum: ["beginner", "intermediate", "advanced"],
  },
  scholarshipAvailable: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  devworkshop: {
    type: mongoose.Schema.ObjectId,
    ref: "Devworkshop",
    required: true,
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
    required: true,
  },
});

// Static method to get avg of program tuitions
ProgramSchema.statics.getAverageCost = async function (devworkshopId) {
  const obj = await this.aggregate([
    {
      $match: { devworkshop: devworkshopId },
    },
    {
      $group: {
        _id: "$devworkshop",
        averageCost: { $avg: "$tuition" },
      },
    },
  ]);

  try {
    if (obj[0]) {
      await this.model("Devworkshop").findByIdAndUpdate(devworkshopid, {
        averageCost: Math.ceil(obj[0].averageCost / 10) * 10,
      });
    } else {
      await this.model("Devworkshop").findByIdAndUpdate(devworkshopid, {
        averageCost: undefined,
      });
    }
  } catch (err) {
    console.error(err);
  }
};

// Call getAverageCost after save
programSchema.post("save", async function () {
  await this.constructor.getAverageCost(this.devworkshop);
});

// Call getAverageCost after remove
programSchema.post("remove", async function () {
  await this.constructor.getAverageCost(this.devworkshop);
});

module.exports = mongoose.model("Program", ProgramSchema);
