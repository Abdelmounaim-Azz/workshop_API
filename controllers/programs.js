const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require("../middleware/async");
const Program = require("../models/Program");
const Devworkshop = require("../models/Devworkshop");

// @desc      Get programs
// @route     GET /api/v1/programs
// @route     GET /api/v1/devworkshops/:devworkshopId/programs
// @access    Public
exports.getPrograms = asyncHandler(async (req, res, next) => {
  if (req.params.devworkshopId) {
    const programs = await Program.find({
      devworkshop: req.params.devworkshopId,
    });

    return res.status(200).json({
      success: true,
      count: programs.length,
      data: programs,
    });
  } else {
    res.status(200).json(res.advancedResults);
  }
});

// @desc      Get single program
// @route     GET /api/v1/programs/:id
// @access    Public
exports.geProgram = asyncHandler(async (req, res, next) => {
  const program = await Program.findById(req.params.id).populate({
    path: "program",
    select: "name description",
  });

  if (!program) {
    return next(new ErrorResponse("No program found", 404));
  }

  res.status(200).json({
    success: true,
    data: course,
  });
});

// @desc      Add program
// @route     POST /api/v1/devworkshops/:devworkshopId/programs
// @access    Private
exports.addProgram = asyncHandler(async (req, res, next) => {
  req.body.devworkshop = req.params.devworkshopId;
  req.body.user = req.user.id;

  const devworkshop = await Devworkshop.findById(req.params.devworkshopId);

  if (!devworkshop) {
    return next(new ErrorResponse("No wrokshop found", 404));
  }

  // Make sure user is workshop owner
  if (
    devworkshop.user.toString() !== req.user.id &&
    req.user.role !== "admin"
  ) {
    return next(
      new ErrorResponse(
        "You are not authorized to add a course to this workshop",
        401
      )
    );
  }

  const program = await Program.create(req.body);

  res.status(200).json({
    success: true,
    data: program,
  });
});

// @desc      Update program
// @route     PUT /api/v1/programs/:id
// @access    Private
exports.updateProgram = asyncHandler(async (req, res, next) => {
  let program = await Program.findById(req.params.id);

  if (!program) {
    return next(new ErrorResponse("No program found", 404));
  }

  // Make sure user is Program owner
  if (program.user.toString() !== req.user.id && req.user.role !== "admin") {
    return next(
      new ErrorResponse("You are not authorized to update this program", 401)
    );
  }

  program = await Program.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  program.save();

  res.status(200).json({
    success: true,
    data: program,
  });
});

// @desc      Delete program
// @route     DELETE /api/v1/programs/:id
// @access    Private
exports.deleteProgram = asyncHandler(async (req, res, next) => {
  const program = await Program.findById(req.params.id);

  if (!program) {
    return next(new ErrorResponse("No program found", 404));
  }

  // Make sure user is the program owner
  if (program.user.toString() !== req.user.id && req.user.role !== "admin") {
    return next(
      new ErrorResponse("You are not authorized to delete this program", 401)
    );
  }

  await program.remove();

  res.status(200).json({
    success: true,
    data: {},
  });
});
