const usersStorage = require("../storages/usersStorage");
const { body, validationResult } = require("express-validator");

const alphaErr = "must only contain letters.";
const lengthErr = "must be between 1 and 10 characters.";
const emailErr = "must be a valid email address.";
const ageErr = "must be a number between 18 and 120.";
const bioErr = "must not exceed 200 characters.";

const validateUser = [
  body("firstName").trim()
    .isAlpha().withMessage(`First name ${alphaErr}`)
    .isLength({ min: 1, max: 10 }).withMessage(`First name ${lengthErr}`),
  body("lastName").trim()
    .isAlpha().withMessage(`Last name ${alphaErr}`)
    .isLength({ min: 1, max: 10 }).withMessage(`Last name ${lengthErr}`),
  body("email").trim()
    .isEmail().withMessage(`Email ${emailErr}`)
    .normalizeEmail(),
  body("age").optional()
    .isInt({ min: 18, max: 120 }).withMessage(`Age ${ageErr}`),
  body("bio").optional()
    .isLength({ max: 200 }).withMessage(`Bio ${bioErr}`),
];

exports.usersListGet = async (req, res) => {
  try {
    const users = await usersStorage.getUsers();  // Asynchronous call
    res.render("index", {
      title: "User list",
      users: users,
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
};

exports.usersCreateGet = (req, res) => {
  res.render("createUser", {
    title: "Create user",
  });
};

exports.usersUpdateGet = async (req, res) => {
  try {
    const user = await usersStorage.getUser(req.params.id);  // Asynchronous call
    res.render("updateUser", {
      title: "Update user",
      user: user,
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
};

exports.usersUpdatePost = [
  validateUser,
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      try {
        const user = await usersStorage.getUser(req.params.id);  // Asynchronous call
        return res.status(400).render("updateUser", {
          title: "Update user",
          user: user,
          errors: errors.array(),
        });
      } catch (err) {
        console.error(err);
        return res.status(500).send("Server Error");
      }
    }

    const { firstName, lastName, email, age, bio } = req.body;
    try {
      await usersStorage.updateUser(req.params.id, { firstName, lastName, email, age, bio });  // Asynchronous call
      res.redirect("/");
    } catch (err) {
      console.error(err);
      res.status(500).send("Server Error");
    }
  }
];

exports.usersCreatePost = [
  validateUser,
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).render("createUser", {
        title: "Create user",
        errors: errors.array(),
      });
    }

    const { firstName, lastName, email, age, bio } = req.body;
    try {
      await usersStorage.addUser({ firstName, lastName, email, age, bio });  // Asynchronous call
      res.redirect("/");
    } catch (err) {
      console.error(err);
      res.status(500).send("Server Error");
    }
  }
];

exports.usersDeletePost = async (req, res) => {
  try {
    await usersStorage.deleteUser(req.params.id);  // Asynchronous call
    res.redirect("/");
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
};

exports.userSearchGet = async (req, res) => {
  const { name, email } = req.query;

  try {
    let users = await usersStorage.getUsers();  // Asynchronous call

    if (name) {
      users = users.filter(user =>
        user.firstName.toLowerCase().includes(name.toLowerCase()) ||
        user.lastName.toLowerCase().includes(name.toLowerCase())
      );
    }

    if (email) {
      users = users.filter(user => user.email.toLowerCase() === email.toLowerCase());
    }

    res.render("searchResult", {
      title: "Search results",
      users: users,
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
};
