const express = require("express");
const {
  getDevworkshops,
  getDevworkshop,
  createDevworkshop,
  updateDevworkshop,
  deleteDevworkshop,
  DevworkshopPhotoUpload,
} = require("../controllers/Devworkshops");

const Devworkshop = require("../models/Devworkshop");

// Include other resource routers
const programRouter = require("./programs");
const reviewRouter = require("./reviews");

const router = express.Router();

const advancedResults = require("../middleware/advancedResults");
const { protect, authorize } = require("../middleware/auth");

// Re-route into other resource routers
router.use("/:devworkshopId/programs", programRouter);
router.use("/:devworkshopId/reviews", reviewRouter);

router
  .route("/:id/photo")
  .put(protect, authorize("publisher", "admin"), DevworkshopPhotoUpload);

router
  .route("/")
  .get(advancedResults(Devworkshop, "programs"), getDevworkshops)
  .post(protect, authorize("publisher", "admin"), createDevworkshop);

router
  .route("/:id")
  .get(getDevworkshop)
  .put(protect, authorize("publisher", "admin"), updateDevworkshop)
  .delete(protect, authorize("publisher", "admin"), deleteDevworkshop);

module.exports = router;
