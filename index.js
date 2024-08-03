const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const dotenv = require('dotenv');
const bodyParser = require('body-parser');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const router = require('express').Router();


dotenv.config();
const app = express();
app.use(express.json());

const corsOptions = {
    origin: '*', // Allow requests from this origin
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type'],
};

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(cors(corsOptions));
app.use(helmet());
app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" }));
app.use(morgan('common'));
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
app.use('/uploads/images', express.static('uploads/images'));
app.use('/public', express.static(path.join(__dirname, 'public')));


const dbUsername = process.env.DB_USERNAME;
const dbPassword = process.env.DB_PASSWORD;
console.log(dbUsername); 
console.log(dbPassword); 
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        return cb(null, "./uploads/images")
    },
    filename: function (req, file, cb) {
        const currentTime = new Date().getTime();
        return cb(null, `${currentTime}-${file.originalname}`)
    }
})
const IMAGE_DIRECTORY = 'uploads/images';
const upload = multer({ storage })
app.post('/api/upload', upload.single('file'), (req, res) => {
    console.log("req.body: ", req.body)
    console.log("req.file: ", req.file)
    const url = `${req.protocol}://${req.get('host')}/${IMAGE_DIRECTORY}/${req.file.filename}`
    return res.status(200).json(url)
})


// const url = `mongodb+srv://${dbUsername}:${dbPassword}@yoursportz.g0lye.mongodb.net`
const url = `mongodb+srv://${dbUsername}:${dbPassword}@freecluster.gfg5x1k.mongodb.net/`
const port = process.env.WEBSITES_PORT || 8080;
mongoose.connect(url, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 30000,
    socketTimeoutMS: 45000
}).then(() => {
    app.listen(port, () => {
        console.log(`Backend server is running on port ${port}`);
    });
}).catch((error) => {
    console.error(`${error} did not connect`);
});


mongoose.connection.on('connected', () => {
    console.log('Mongoose connected to DB Cluster');
});

mongoose.connection.on('error', (error) => {
    console.error('Mongoose connection error:', error);
});

mongoose.connection.on('disconnected', () => {
    console.log('Mongoose disconnected');
});
