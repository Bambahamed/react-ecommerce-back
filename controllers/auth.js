const User = require("../models/user");

const { authCheck } = require("../middlewares/auth");

exports.createOrUpdateUser = async (req, res) => {
  try {
    await authCheck(req, res); // Appel de la fonction authCheck pour vérifier l'authentification

    if (req.user) {
      const { name, picture, email } = req.user;

      const user = await User.findOneAndUpdate(
        { email },
        { name: email.split("@")[0], picture },
        { new: true }
      );
      if (user) {
        console.log("USER UPDATED", user);
        res.json(user);
      } else {
        const newUser = await new User({
          email,
          name: email.split("@")[0],
          picture,
        }).save();
        console.log("USER CREATED", newUser);
        res.json(newUser);
      }
    } else {
      console.log("Utilisateur inexistant", req.user);
      res.status(400).json({ error: "Utilisateur inexistant" });
    }
  } catch (err) {
    console.error("Erreur lors de l'authentification :", err);
    res.status(401).json({ error: "Erreur lors de l'authentification" });
  }
};

exports.currentUser = async (req, res) => {
  try {
    await authCheck(req, res);
    User.findOne({ email: req.user.email })
      .exec()
      .then((user) => {
        if (!user) {
          return res.status(404).json({ error: "User not found" });
        }
        res.json(user);
      })
      .catch((err) => {
        console.error("Error finding user:", err);
        res.status(500).json({ error: "Internal server error" });
      });
  } catch (error) {}
};
