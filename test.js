const express = require("express");
const formidable = require("express-formidable");
const app = express();
app.use(formidable());
const cloudinary = require("cloudinary").v2;
cloudinary.config({
  cloud_name: "azijin",
  api_key: "843235519668172",
  api_secret: "53X0qcdwWcUkSdCj-All1vBnPL8",
});

app.post("/vinted/test", async (req, res) => {
  try {
    const pictureToUpload = req.files.henley.path;
    const upload = await cloudinary.uploader.upload(pictureToUpload, {
      folder: "/test",
      public_id: "test-image",
    });

    res.status(200).json(upload.secure_url);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.listen(3000, (req, res) => {
  console.log("test server started");
});
