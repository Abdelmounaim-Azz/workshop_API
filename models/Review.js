const mongoose = require("mongoose");

const ReviewSchema = new mongoose.Schema({
  title: {
    type: String,
    trim: true,
    required: [true, "Please add a title for the review"],
    maxlength: 100,
  },
  text: {
    type: String,
    required: [true, "Please add some text"],
  },
  rating: {
    type: Number,
    min: 1,
    max: 5,
    required: [true, "Please add a rating between 1 and 5"],
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

// Prevent user from submitting more than one review per devworkshop
ReviewSchema.index({ devworkshop: 1, user: 1 }, { unique: true });

// Static method to get avg rating and save
ReviewSchema.statics.getAverageRating = async function (devworkshopId) {
  const obj = await this.aggregate([
    {
      $match: { devworkshop: devworkshopId },
    },
    {
      $group: {
        _id: "$devworkshop",
        averageRating: { $avg: "$rating" },
      },
    },
  ]);

  try {
    await this.model("Devworkshop").findByIdAndUpdate(devworkshopId, {
      averageRating: obj[0].averageRating,
    });
  } catch (err) {
    console.error(err);
  }
};

// Call getAverageCost after save
ReviewSchema.post("save", async function () {
  await this.constructor.getAverageRating(this.devworkshop);
});

// Call getAverageCost before remove
ReviewSchema.post("remove", async function () {
  await this.constructor.getAverageRating(this.devworkshop);
});

module.exports = mongoose.model("Review", ReviewSchema);
