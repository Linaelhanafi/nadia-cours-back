const express = require('express')
const mongoose = require('mongoose')
const multer = require('multer')
const Course = require('../Models/Course')
const methodOverride = require('method-override')
const { GridFSBucket } = require('mongodb');
const { GridFsStorage } = require('multer-gridfs-storage')
require('dotenv').config()

const router = express.Router()
// Create storage engine

const storage = new GridFsStorage({
    url: process.env.MONGODB_URI,
    file: (req, file) => {
        return new Promise((resolve, reject) => {
            const filename = file.originalname;
            const fileInfo = {
                filename: filename,
                bucketName: 'uploads'
            };
            resolve(fileInfo);
        });
    }
});

const upload = multer({ storage });

router.post('/uploadCourse', upload.single('file'), async (req, res, err) => {
    try {
        const newCour = new Course({
            name: req.body.name,
            section: req.body.section,
            subject: req.body.subject,
            file: req.file.id
        });
        const courseAdded = await newCour.save();
        // console.log(courseAdded);
        res.status(201).json({
            message: "course uploaded successfuly",
            newCou: courseAdded
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error });
    }
});

router.get('/getCourses', async (req, res) => {
    try {
        const courses = await Course.aggregate([
            {
                $lookup: {
                    from: "uploads.files",
                    localField: "file",
                    foreignField: "_id",
                    as: "file"
                }
            },
            {
                $unwind: "$file" // this is used to flatten the file object if you expect one file per 'cour'
            }
        ]);
        // console.log(courses)
        res.status(200).json({
            courses
        })
    } catch (e) {
        res.status(404).json({ error: e })
    }
})
// console.log(db.db)

router.get('/getCourse/:id', (req, res) => {
    try {
        const bucket = new GridFSBucket(mongoose.connection.db, {
            bucketName: 'uploads'
        });
        const fileId = new mongoose.Types.ObjectId(req.params.id);
        bucket.openDownloadStream(fileId)
            .on('error', function (error) {
                console.error(error);
                res.status(500).send('Error occurred while downloading file');
            })
            .pipe(res)
            .on('finish', function () {
                console.log('File download completed');
            });
    } catch (e) {
        console.log(e)
    }
})

router.delete('/deleteCourse/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const deletedCourse = await Course.findByIdAndDelete(id);

        if (!deletedCourse) {
            return res.status(404).json({ message: "Course not found" });
        }

        res.status(200).json({ message: "Course deleted successfully", deletedCourse });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
});

// router.get('/getCourse/:filename', async (req, res) => {
//     try {
//         const filename = req.params.filename;
//         let bucket;
//         // try {
//         //     // Create a new GridFSBucket instance
//         //     bucket = new GridFSBucket(mongoose.connection.db, {
//         //         bucketName: 'uploads' // same as the bucket name used when uploading files
//         //     });
//         // } catch (error) {
//         //     return res.status(500).send('Error initializing GridFSBucket');
//         // }

//         // Check if file exists
//         const files = await bucket.find({ filename }).toArray();
//         if (!files || files.length === 0) {
//             return res.status(404).send('No file exists');
//         }

//         // If file exists, create read stream
//         const downloadStream = bucket.openDownloadStreamByName(filename);

//         downloadStream.on('error', (err) => {
//             res.sendStatus(500).send(err);
//         });

//         downloadStream.on('end', () => {
//             res.end();
//         });
//     } catch (e) {
//         console.log(e)
//         res.status(500).json({ e })
//     }
// });

module.exports = router