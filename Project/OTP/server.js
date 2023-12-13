const express = require('express');
const otpGenerator = require('otp-generator');
const transporter = require('./emailConfig');
const bodyParser = require('body-parser'); // Add this line

const app = express();
const port = 3000;

// Use express.json() middleware for parsing JSON requests
app.use(express.json());

// Use body-parser middleware for parsing URL-encoded data
app.use(bodyParser.urlencoded({ extended: true }));

// In-memory storage for OTPs and timestamps
const otpStorage = {};

// Endpoint to request OTP
app.post('/send-otp', (req, res) => {
    console.log(req.body, 'hello');
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ error: 'Email is required' });
    }

    // Generate OTP
    const otp = otpGenerator.generate(6, { digits: true, alphabets: false, upperCase: false, specialChars: false });

    // Store the OTP and timestamp in memory
    otpStorage[email] = {
        otp,
        timestamp: Date.now(),
    };

    // Email options
    const mailOptions = {
        from: 'p200165@pwr.nu.edu.pk',
        to: email,
        subject: 'OTP for Verification',
        text: `Your OTP is: ${otp}`,
    };

    // Send email using the transporter
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.log(error);
            return res.status(500).json({ error: 'Failed to send OTP email' });
        }
    
        res.status(200).json({ message: 'OTP sent successfully' });
    });
});

// Endpoint to verify OTP
app.post('/verify-otp', (req, res) => {
    console.log(req.body); // Log received data
    const { email, otp } = req.body;

    if (!email || !otp) {
        return res.status(400).json({ error: 'Email and OTP are required' });
    }

    const storedData = otpStorage[email];

    if (!storedData || otp !== storedData.otp) {
        return res.status(401).json({ error: 'Invalid OTP' });
    }

    // Check if the OTP is still valid (within 30 seconds)
    const currentTime = Date.now();
    const validityPeriod = 60000; // 30 seconds

    if (currentTime - storedData.timestamp <= validityPeriod) {
        res.status(200).json({ message: 'OTP is valid' });
    } else {
        res.status(401).json({ error: 'OTP has expired' });
    }
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
