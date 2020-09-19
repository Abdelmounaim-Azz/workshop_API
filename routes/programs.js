const express = require("express");
const {
  getPrograms,
  getProgram,
  addProgram,
  updateProgram,
  deleteProgram,
} = require("../controllers/programs");

const Program = require("../models/Program");

const router = express.Router({ mergeParams: true });

const advancedResults = require("../middleware/advancedResults");
const { protect, authorize } = require("../middleware/auth");

router
  .route("/")
  .get(
    advancedResults(Program, {
      path: "devworkshop",
      select: "name description",
    }),
    getPrograms
  )
  .post(protect, authorize("publisher", "admin"), addProgram);

router
  .route("/:id")
  .get(getProgram)
  .put(protect, authorize("publisher", "admin"), updateProgram)
  .delete(protect, authorize("publisher", "admin"), deleteProgram);

module.exports = router;
