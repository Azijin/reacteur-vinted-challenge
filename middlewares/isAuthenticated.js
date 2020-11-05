const User = require("../models/User");
const isAuthenticated = async (req, res, next) => {
  try {
    //si il y un token, il est égal à Bearer token, on supprime bearer
    const token = req.headers.authorization.replace("Bearer ", "");
    if (req.headers.authorization.replace("Bearer ", "")) {
      const user = await User.findOne({ token: token }).select(
        "account email _id"
      );
      if (user) {
        //si il y a un user, on ajoute à la requête client le user
        req.user = user;

        return next();
      } else {
        //si pas de user on indique non autorisé
        return res.status(401).json({ error: "Unauthorized" });
      }
    } else {
      //si pas de token on indique non autorisé
      return res.status(401).json({ error: "Unauthorized" });
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
module.exports = isAuthenticated;
