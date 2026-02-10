// SimpleAI server.js
const express = require("express");
const bodyParser = require("body-parser");
const fetch = require("node-fetch"); // must use node-fetch v2 if Node <18
const app = express();
const PORT = process.env.PORT || 10000;

// --------- CORS Setup ----------
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*"); // allow all origins
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

// --------- Body Parser ----------
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// --------- Static Files ----------
app.use(express.static("public")); // if you put your HTML in public/

// --------- Health Check ----------
app.get("/", function(req, res) {
    res.send("SimpleAI server is running. ✅");
});

// --------- POST /chat ----------
app.post("/chat", async function(req, res) {
    try {
        var userMessage = req.body.message;

        if (!userMessage) {
            return res.json({ reply: "No message received." });
        }

        // Call Gemini API
        var response = await fetch(
            "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=AIzaSyDzKIMHQssCV4CpPZCJMITfWcm_PUI1mx4",
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

        var data = await response.json();

        // Safely extract AI reply
        var reply = "No response.";
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

// --------- Start Server ----------
app.listen(PORT, function() {
    console.log("SimpleAI server running on port " + PORT);
    console.log("==> Your service is live 🎉");
});
