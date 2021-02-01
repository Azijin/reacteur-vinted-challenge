const express = require("express");
const router = express.Router();
const stripe = require("stripe")(process.env.STRIPE_API_SECRET);
const cloudinary = require("cloudinary").v2;

const Offer = require("../models/Offer");
const User = require("../models/User");

const isAuthenticated = require("../middlewares/isAuthenticated");

router.post("/vinted/payment", isAuthenticated, async (req, res) => {
  try {
    console.log(req.fields);
    const { amount, id } = req.fields;
    const offer = await Offer.findById(id);
    console.log(offer);
    if (offer) {
      const { product_name, product_description } = offer;
      const stripeToken = req.fields.stripeToken;
      const response = await stripe.charges.create({
        amount: amount * 100,
        currency: "eur",
        description: `${product_name} : ${product_description}`,
        source: stripeToken,
      });
      console.log(response);
      if (response.status === "succeeded") {
        const owner = await User.findById(offer.owner);
        if (owner) {
          await cloudinary.api.delete_resources([
            offer.product_image.public_id,
          ]);
          await cloudinary.api.delete_folder(
            `/vinted/user/${owner.account.username}/offers/${id}`,
            (error, result) => {
              console.log(result);
            }
          );
          await offer.delete();
          res.status(200).json(response);
        }
      } else {
        res.status(400).json({ message: response.status });
      }
    } else {
      res.status(400).json({ message: "no offer found" });
    }
  } catch (error) {
    console.log(error);
  }
});
module.exports = router;
