const express = require('express')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const User = require('../Models/Users')
const router = express.Router()

router.post('/register', async (req, res) => {
    try {
        const user = new User(req.body)
        await user.save()
        res.status(201).send({ message: 'User registered successfully' })
    } catch (error) {
        console.log(error)
        res.status(400).send(error)
    }
});

router.post('/login', async (req, res) => {
    try {
        console.log(req.body)
        const user = await User.findOne({ email: req.body.email });
        if (!user || !await bcrypt.compare(req.body.password, user.password)) {
            return res.status(400).send({ message: 'Invalid credentials' });
        }

        const token = jwt.sign({ _id: user._id }, 'SECRET_KEY', { expiresIn: '1h' });
        res.send({ token });
    } catch (error) {
        console.log(error)
        res.status(400).send(error);
    }
});

module.exports = router