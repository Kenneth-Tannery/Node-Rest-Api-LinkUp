const router = require('express').Router();
const User = require('../models/user');
const bcrypt = require('bcrypt');

//register
router.post("/register", async (req, res) => {
    try {
        //generate hashed password
        const salt = await brcypt.genSalt(10);
        const hashedPassword = await brcypt.hash(req.body.password, salt);

        //generate new user
        const newUser = new User({
            username: req.body.username,
            email: req.body.email,
            password: hashedPassword,
        });

        //save user and respond
        const user = await newUser.save();
        res.status(200).json(user);
    } catch (err) {
        console.log(err);
    }
});

module.exports = router