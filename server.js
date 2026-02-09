const express = require("express");
const fetch = require("node-fetch");

const app = express();
app.use(express.json());

// Render uses environment variables
const API_KEY = process.env.API_KEY;

if (!API_KEY) {
    console.error("❌ API_KEY is missing");
    process.exit(1);
}

app.post("/chat", function (req, res) {
    if (!req.body || !req.body.message) {
        return res.json({ reply: "No message received." });
    }

    fetch(
        "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=" + API_KEY,
        {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                contents: [
                    {
                        role: "user",
                        parts: [{ text: req.body.message }]
                    }
                ]
            })
        }
    )
    .then(function (response) {
        return response.json();
    })
    .then(function (data) {
        let reply = "AI returned nothing.";

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
    })
    .catch(function (err) {
        console.error("❌ Gemini fetch failed:", err);
        res.json({ reply: "Server failed to reach AI." });
    });
});

// Render provides PORT automatically
const PORT = process.env.PORT || 3000;
app.listen(PORT, function () {
    console.log("✅ SimpleAI server running on port", PORT);
});
