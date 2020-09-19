const mongoose = require("mongoose");
const slugify = require("slugify");
const DevworkshopSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please add a name"],
      unique: true,
      trim: true,
      maxlength: [50, "Name can not be more than 50 characters"],
    },
    slug: String,
    description: {
      type: String,
      required: [true, "Please add a description"],
      maxlength: [500, "Description can not be more than 500 characters"],
    },
    website: {
      type: String,
      match: [
        /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/,
        "Please use a valid URL",
      ],
    },
    email: {
      type: String,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        "Please add a valid email",
      ],
    },
    phone: {
      type: String,
      maxlength: [15, "Phone number can not be longer than 15 characters"],
    },
    address: {
      type: String,
      required: [true, "Please add an address"],
    },
    careers: {
      // Array of strings
      type: [String],
      required: true,
      enum: ["Web Development", "UI/UX", "Data Science", "Devops", "Other"],
    },
    averageRating: {
      type: Number,
      min: [1, "Rating must be at least 1"],
      max: [5, "Rating must can not be more than 5"],
    },
    averageCost: Number,
    photo: {
      type: String,
      default: "no-photo.jpg",
    },
    acceptGi: {
      type: Boolean,
      default: false,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Create Devworkshop slug from its name
DevworkshopSchema.pre("save", function (next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

// delete programs when a devworkshop is deleted
DevworkshopSchema.pre("remove", async function (next) {
  console.log(`Programs being removed `);
  await this.model("Program").deleteMany({ devworkshop: this._id });
  next();
});

// Reverse populate with virtuals
DevworkshopSchema.virtual("programs", {
  ref: "Program",
  localField: "_id",
  foreignField: "devworkshop",
  justOne: false,
});

module.exports = mongoose.model("Devworkshop", DevworkshopSchema);
