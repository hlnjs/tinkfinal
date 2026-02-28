const express = require("express");
const cors = require("cors");
const path = require("path");
const dotenv = require("dotenv");

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static("public"));

const GEMINI_KEY = process.env.GEMINI_KEY;
app.get('/',(req, res) =>{res.sendFile(path.join(__dirname, 'public', 'index.html'))});

app.post("/chat", async (req, res) =>
{
  try
  {
    const message = req.body.message;

    console.log("User:", message);

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_KEY}`,
      {
        method: "POST",

        headers:
        {
          "Content-Type": "application/json"
        },

        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: `You are Studoo AI, a helpful study assistant.\n\nStudent question: ${message}`
                }
              ]
            }
          ]
        })
      }
    );

    const data = await response.json();

    console.log("Gemini response:", data);

    const reply =
      data.candidates?.[0]?.content?.parts?.[0]?.text ||
      "No response from Gemini";

    res.json({
      reply: reply
    });

  }

  catch(err)
  {
    console.log("Server error:", err);

    res.json({
      reply: "Gemini server error"
    });
  }
});

app.listen(3000, () =>
{
  console.log("Gemini server running on http://localhost:3000");
});