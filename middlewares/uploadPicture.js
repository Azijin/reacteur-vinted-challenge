const uploadPicture = async (req, res, next) => {
  try {
    if (req.files.picture) {
      return next();
    } else {
      res.status(400).json({ error: { message: "Missing picture" } });
      console.log(req);
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
module.exports = uploadPicture;
