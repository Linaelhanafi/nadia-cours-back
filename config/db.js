const mongoose = require('mongoose');
const Grid = require('gridfs-stream');
const dotenv = require('dotenv')

dotenv.config()

const connectDb = async () => {
    const MondodbUrl = process.env.MONGODB_URI
    await mongoose.connect(MondodbUrl, { useNewUrlParser: true, useUnifiedTopology: true });
    let grid;
    const db = mongoose.connection;
    db.on('error', console.error.bind(console, 'connection error:'));
    db.once('open', () => {
        // Init stream
        gfs = Grid(db, mongoose.mongo);
        gfs.collection('uploads');
    });
    console.log("MongoDb Connected")
}
module.exports = connectDb