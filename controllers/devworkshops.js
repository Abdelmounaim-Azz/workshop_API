const path = require("path");
const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require("../middleware/async");
const Devworkshop = require("../models/Devworshop");

// @desc      Get all devworkshops
// @route     GET /api/v1/devworkshops
// @access    Public
exports.getdevworkshops = asyncHandler(async (req, res, next) => {
  res.status(200).json(res.advancedResults);
});

// @desc      Get single devworkshop
// @route     GET /api/v1/devworkshops/:id
// @access    Public
exports.getDevworkshop = asyncHandler(async (req, res, next) => {
  const devworkshop = await Devworkshop.findById(req.params.id);

  if (!devworkshop) {
    return next(new ErrorResponse("Devworkshop not found ", 404));
  }

  res.status(200).json({ success: true, data: devworkshop });
});

// @desc      Create new devworkshop
// @route     POST /api/v1/devworkshops
// @access    Private
exports.createDevworkshop = asyncHandler(async (req, res, next) => {
  // Add user to req,body
  req.body.user = req.user.id;

  // Check for published devworkshop
  const publisheddevworkshop = await Devworkshop.findOne({ user: req.user.id });

  // If the user is not an admin, they can only add one devworkshop
  if (publisheddevworkshop && req.user.role !== "admin") {
    return next(
      new ErrorResponse("The user  has already published a devworkshop", 400)
    );
  }

  const devworkshop = await Devworkshop.create(req.body);

  res.status(201).json({
    success: true,
    data: devworkshop,
  });
});

// @desc      Update devworkshop
// @route     PUT /api/v1/devworkshops/:id
// @access    Private
exports.updateDevworkshop = asyncHandler(async (req, res, next) => {
  let devworkshop = await Devworkshop.findById(req.params.id);

  if (!devworkshop) {
    return next(new ErrorResponse("Devworkshop not found ", 404));
  }

  // Make sure user is devworkshop owner
  if (
    devworkshop.user.toString() !== req.user.id &&
    req.user.role !== "admin"
  ) {
    return next(
      new ErrorResponse("You are not authorized to update this workshop", 401)
    );
  }

  devworkshop = await Devworkshop.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({ success: true, data: devworkshop });
});

// @desc      Delete devworkshop
// @route     DELETE /api/v1/devworkshops/:id
// @access    Private
exports.deleteDevworkshop = asyncHandler(async (req, res, next) => {
  const devworkshop = await Devworkshop.findById(req.params.id);

  if (!devworkshop) {
    return next(new ErrorResponse("Devworkshop not found ", 404));
  }

  // Make sure user is workshop owner
  if (workshop.user.toString() !== req.user.id && req.user.role !== "admin") {
    return next(
      new ErrorResponse("you are not authorized to delete this workshop", 401)
    );
  }

  await devworkshop.remove();

  res.status(200).json({ success: true, data: {} });
});

// @desc      Upload photo for devworkshop
// @route     PUT /api/v1/devworkshops/:id/photo
// @access    Private
exports.devworkshopPhotoUpload = asyncHandler(async (req, res, next) => {
  const devworkshop = await Devworkshop.findById(req.params.id);

  if (!devworkshop) {
    return next(new ErrorResponse("devworkshop not foud", 404));
  }

  // Make sure user is devworkshop owner
  if (
    devworkshop.user.toString() !== req.user.id &&
    req.user.role !== "admin"
  ) {
    return next(
      new ErrorResponse("You ar not authorized to update this workshop", 401)
    );
  }

  if (!req.files) {
    return next(new ErrorResponse(`Please upload a file`, 400));
  }

  const file = req.files.file;

  // Make sure the image is a photo
  if (!file.mimetype.startsWith("image")) {
    return next(new ErrorResponse(`Please upload an image file`, 400));
  }

  // Check filesize
  if (file.size > process.env.MAX_FILE_UPLOAD) {
    return next(
      new ErrorResponse(
        `Please upload an image less than ${process.env.MAX_FILE_UPLOAD}`,
        400
      )
    );
  }

  // Create custom filename
  file.name = `photo_${devworkshop._id}${path.parse(file.name).ext}`;

  file.mv(`${process.env.FILE_UPLOAD_PATH}/${file.name}`, async (err) => {
    if (err) {
      console.error(err);
      return next(new ErrorResponse(`Problem with file upload`, 500));
    }

    await Devworkshop.findByIdAndUpdate(req.params.id, { photo: file.name });

    res.status(200).json({
      success: true,
      data: file.name,
    });
  });
});
