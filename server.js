const express = require('express');
const nodemailer = require('nodemailer');
const multer = require('multer');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Set up middleware
app.use(cors()); // Enable CORS if necessary
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Set up static files (e.g., CSS)
app.use(express.static(path.join(__dirname, 'public'))); // Ensure this points to your CSS folder

// Serve the HTML file
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'join_advocate.html')); // Update to your HTML file path
});

// Set up multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/'); // Make sure this directory exists
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname); // Save with original name
    }
});

const upload = multer({ storage: storage });

// Handle form submission
app.post('/submit', upload.single('resume'), (req, res) => {
    console.log(req.body); // Log form data
    console.log(req.file);  // Log file info

    const { name, phone, email, location, experience, specialized, enrollment, message } = req.body;
    const resume = req.file;

    if (!resume) {
        return res.status(400).send('No file uploaded.');
    }

    // Create reusable transporter object using the default SMTP transport
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'chat.judicial365@gmail.com', // Your email
            pass: 'vphislaemdjwcxpn' // Your app password
        }
    });

    // Set up email data
    const mailOptions = {
        from: '"JustIn Law" <chat.judicial365@gmail.com>', // sender address
        to: email, // receiver email
        subject: 'New Advocate Submission', // Subject line
        text: `Name: ${name}\nPhone: ${phone}\nEmail: ${email}\nLocation: ${location}\nExperience: ${experience}\nSpecialized: ${specialized}\nEnrollment: ${enrollment}\nMessage: ${message}`,
        attachments: [
            {
                filename: resume.originalname,
                path: resume.path // path to the uploaded resume
            }
        ]
    };

    // Send mail with defined transport object
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.log(error);
            return res.status(500).send('Error sending email: ' + error.message);
        }
        res.status(200).send('Email sent successfully!');
    });
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server started on http://localhost:${PORT}`);
});
