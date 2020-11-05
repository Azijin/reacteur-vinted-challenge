const express = require("express");
const router = express.Router();
const cloudinary = require("cloudinary").v2;

const User = require("../models/User");
const Offer = require("../models/Offer");

const isAuthenticated = require("../middlewares/isAuthenticated");
const uploadPicture = require("../middlewares/uploadPicture");

router.post(
  "/vinted/offer/publish",
  isAuthenticated,
  uploadPicture,
  async (req, res) => {
    try {
      const {
        title,
        description,
        price,
        condition,
        city,
        brand,
        size,
        color,
      } = req.fields;
      if (
        title &&
        description &&
        price &&
        condition &&
        city &&
        brand &&
        size &&
        color
      ) {
        if (description.length > 5000) {
          res.status(400).json({
            error: {
              message:
                "The product description is too long, max characters 5000",
            },
          });
        }
        if (title.length > 50) {
          res.status(400).json({
            error: {
              message: "The product title is too long, max characters 50",
            },
          });
        }
        if (price > 100000) {
          res.status(400).json({
            error: { message: "The product price shoud less than 100 000" },
          });
        }
        const user = req.user;
        const picture = req.files.picture.path;
        const newOffer = new Offer({
          product_name: title,
          product_description: description,
          product_price: price,
          product_details: [
            { MARQUE: brand },
            { TAILLE: size },
            { ETAT: condition },
            { COULEUR: color },
            { EMPLACEMENT: city },
          ],
          product_image: {},
          owner: user,
        });
        const pictureToUpload = await cloudinary.uploader.upload(picture, {
          folder: `/vinted/user/${user.account.username}/offers/${newOffer._id}`,
          public_id: `${title}`,
        });
        newOffer.product_image = pictureToUpload;
        await newOffer.save();
        res.status(200).json(newOffer);
      } else {
        res
          .status(400)
          .json({ error: { message: "Missing informations in the offer" } });
      }
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
);

router.get("/vinted/offers", async (req, res) => {
  try {
    let filters = {};
    if (req.query.title) {
      filters.product_name = new RegExp(req.query.title, "i");
    }
    if (req.query.priceMin) {
      filters.product_price = { $gte: req.query.priceMin };
    }
    if (req.query.priceMax) {
      if (filters.product_price) {
        filters.product_price.$lte = req.query.priceMax;
      } else {
        filters.product_price = { $lte: req.query.priceMax };
      }
    }

    let sort = {};
    if (req.query.sort === "price-desc") {
      sort.product_price = -1;
    } else if (req.query.sort === "price - asc") {
      sort.product_price = 1;
    }
    let limit = 5;
    if (req.query.limit) {
      limit = Number(req.query.limit);
    }
    let page = 1;
    if (req.query.page) {
      page = Number(req.query.page);
    }
    const count = await Offer.countDocuments(filters);
    const offers = await Offer.find(filters)
      .populate({
        path: "owner",
        select: "account",
      })
      .sort(sort)
      .limit(limit)
      .skip((page - 1) * limit);
    res.status(200).json({ count: count, offers: [offers] });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Update an offer
// TO DO => handle the image update
router.put("/vinted/offer/update", isAuthenticated, async (req, res) => {
  try {
    const {
      id,
      title,
      description,
      price,
      brand,
      size,
      condition,
      color,
      city,
    } = req.fields;
    const offerToUpdate = await Offer.findById(id).select(
      "product_name product_description product_price product_details"
    );
    if (offerToUpdate) {
      if (title) {
        offerToUpdate.product_name = title;
      }
      if (description) {
        offerToUpdate.product_description = description;
      }
      if (price) {
        offerToUpdate.product_price = price;
      }
      if (brand) {
        offerToUpdate.product_details[0].MARQUE = brand;
      }
      if (size) {
        offerToUpdate.product_details[1].TAILLE = size;
      }
      if (condition) {
        offerToUpdate.product_details[2].ETAT = condition;
      }
      if (color) {
        offerToUpdate.product_details[3].COULEUR = color;
      }
      if (city) {
        offerToUpdate.product_details[4].EMPLACEMENT = city;
      }
      await offerToUpdate.save();
      res
        .status(200)
        .json({ message: "The offer has been updated", offer: offerToUpdate });
    } else {
      res
        .status(400)
        .json({ error: { message: "There is no offer with this id" } });
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

//delete an offer
router.delete("/vinted/offer/delete", isAuthenticated, async (req, res) => {
  try {
    const offerToDelete = await Offer.findById(req.query.id);
    if (offerToDelete) {
      await cloudinary.api.delete_resources([
        offerToDelete.product_image.public_id,
      ]);
      await cloudinary.api.delete_folder(
        `/vinted/user/${req.user.account.username}/offers/${req.query.id}`,
        (error, result) => {
          console.log(result);
        }
      );
      await offerToDelete.delete();
      res
        .status(200)
        .json({ message: "The offer has been successfully deleted" });
    } else {
      res
        .status(400)
        .json({ error: { message: "No offer found with this id" } });
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

//get offer by id
router.get("/vinted/offer/:id", async (req, res) => {
  try {
    const offerToFind = await Offer.findById(req.params.id).populate({
      path: "owner",
      select: "account",
    });
    if (offerToFind) {
      res.status(200).json(offerToFind);
    } else {
      res
        .status(400)
        .json({ error: { message: "There is no offer with this id" } });
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});
module.exports = router;
