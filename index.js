const express = require('express')
const connectDb = require('./config/db')
const nodemailer = require("nodemailer")
const methodOverride = require('method-override');
const bodyParser = require('body-parser')
const cors = require('cors');
require('dotenv').config()

const app = express()

connectDb()
app.use(express.json())
app.use(bodyParser.json());
app.use(methodOverride('_method'));
app.use(cors());

const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
        // TODO: replace `user` and `pass` values from <https://forwardemail.net>
        user: 'walidelmoumen2002@gmail.com',
        pass: 'mvspbhmuyxcufpwp'
    }
});

app.use('/Course', require('./routes/Courses'))
app.use('/User', require('./routes/User'))


app.post('/sendEmail', async (req, res) => {
    try {
        console.log(req.body)
        const { nom, prenom, filiere, email, message } = req.body
        const info = await transporter.sendMail({
            from: email, // sender address
            to: "walidelmoumen2002@gmail.com", // list of receivers
            subject: `${nom} ${prenom}`,  // Subject line
            text: message, // plain text body
        });
        res.status(200).json({
            message: "message envoyé"
        })
    } catch (error) {
        res.status(500).json({
            message: error
        })
        console.log(error)
    }
})

app.listen(process.env.PORT, () => {
    console.log(`APP RUNNING ON PORT ${process.env.PORT}`)
})