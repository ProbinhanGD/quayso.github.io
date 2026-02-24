const express = require("express");
const nodemailer = require("nodemailer");
const cors = require("cors");
const fs = require("fs");

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

app.get("/", (req, res) => {
    res.sendFile(__dirname + "/index.html");
});

const DATA_FILE = "users.json";

// Nếu chưa có file thì tạo
if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify([]));
}

app.post("/send", async (req, res) => {
    const { username } = req.body;

    let users = JSON.parse(fs.readFileSync(DATA_FILE));

    // Nếu username đã tồn tại
    if (users.find(u => u.username === username)) {
        return res.json({ success: false, message: "Chỉ một lần thôi cu" });
    }

    // Random số
    let number = Math.floor(Math.random() * (1800200 - 1800100 + 1)) + 1800100;

    // Lưu vào file
    users.push({
        username: username,
        number: number,
        time: new Date().toLocaleString()
    });

    fs.writeFileSync(DATA_FILE, JSON.stringify(users, null, 2));

    // Gửi mail
    let transporter = nodemailer.createTransport({
        service: "gmail",
auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
}
    });

    await transporter.sendMail({
        from: "mosfet115405@gmail.com",
        to: "mosfet115405@gmail.com",
        subject: "New Random Number",
        text: `Username: ${username}\nNumber: ${number}`
    });

    res.json({ success: true, number });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log("Server running on port " + PORT);

});

