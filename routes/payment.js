const express = require("express");
const router = express.Router();
const stripe = require("stripe")(process.env.STRIPE_API_SECRET);

const Offer = require("../models/Offer");

app.post("/vinted/pay", async (req, res) => {
  try {
    const { amount, id } = req.fields;
    const offer = await (await Offer.findById(id)).isSelected(
      "product_name product_description"
    );
    if (offer) {
      const { product_name, product_description } = offer;
      const stripeToken = req.fields.stripeToken;
      const response = await stripe.charges.create({
        amount: amount,
        currency: "eur",
        description: `${product_name} : ${product_description}`,
        source: stripeToken,
      });
      console.log(response.status);
      res.status(200).json(reponse);
    } else {
      res.status(400).json({ message: "no offer found" });
    }
  } catch (error) {}
});