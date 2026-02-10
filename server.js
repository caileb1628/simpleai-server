const express = require("express");
const bodyParser = require("body-parser");
const fetch = require("node-fetch");

const app = express();
const PORT = process.env.PORT || 10000;

app.use(bodyParser.json());
app.use(express.static("public"));

app.get("/", function (req, res) {
    res.send("SimpleAI server is running. ✅");
});

app.post("/chat", async function (req, res) {
    try {
        const userMessage = req.body.message;

        if (!userMessage) {
            return res.json({ reply: "No message received." });
        }

        const response = await fetch(
            "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=AIzaSyBsncBwKqjkOxQ2OteTzF1Vy4FXFbPOtPk",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    contents: [
                        {
                            parts: [{ text: userMessage }]
                        }
                    ]
                })
            }
        );

        const data = await response.json();

        let reply = "No response.";

        if (
            data &&
            data.candidates &&
            data.candidates[0] &&
            data.candidates[0].content &&
            data.candidates[0].content.parts &&
            data.candidates[0].content.parts[0]
        ) {
            reply = data.candidates[0].content.parts[0].text;
        }

        res.json({ reply: reply });

    } catch (err) {
        console.error(err);
        res.json({ reply: "AI crashed like iOS beta." });
    }
});

app.listen(PORT, function () {
    console.log("SimpleAI server running on port " + PORT);
});
