require("dotenv").config();
const axios = require("axios");
const { App } = require("@slack/bolt");

console.log("BOT STARTING...");

const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  appToken: process.env.SLACK_APP_TOKEN,
  socketMode: true,
});

//
// 🤖 /chckn-ai (Gemini 2.5 Flash)
//
app.command("/chckn-ai", async ({ command, ack, respond }) => {
  await ack();

  const userInput = command.text?.trim();

  if (!userInput) {
    return respond("Usage: `/chckn-ai your question here`");
  }

  try {
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        contents: [
          {
            role: "user",
            parts: [
              {
                text: `You are a helpful, concise Slack assistant named ChickenBot.\n\nUser: ${userInput}`
              }
            ]
          }
        ]
      },
      {
        headers: {
          "Content-Type": "application/json"
        }
      }
    );

    const reply =
      response.data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      "No response from AI.";

    await respond({
      text: reply
    });

  } catch (err) {
    console.error("Gemini Error:", err.response?.data || err.message);
    await respond("AI request failed.");
  }
});

//
// ⚡ /chckn-ping
//
app.command("/chckn-ping", async ({ ack, respond }) => {
  const start = Date.now();
  await ack();

  await respond({
    text: `Pong!\nLatency: ${Date.now() - start}ms`
  });
});

//
// ✏️ /chckn-echo
//
app.command("/chckn-echo", async ({ command, ack, respond }) => {
  await ack();

  const text = command.text?.trim();

  if (!text) {
    return respond("Usage: `/chckn-echo your message here`");
  }

  await respond({
    text: `*${text}*`
  });
});

//
// 🪙 /chckn-coinflip
//
app.command("/chckn-coinflip", async ({ ack, respond }) => {
  await ack();

  const result = Math.random() < 0.5 ? "Heads 🪙" : "Tails 🪙";

  await respond({
    text: `You flipped: *${result}*`
  });
});

//
// 📚 /chckn-randomfact
//
app.command("/chckn-randomfact", async ({ ack, respond }) => {
  await ack();

  try {
    const response = await axios.get(
      "https://api.api-ninjas.com/v1/facts",
      {
        headers: {
          "X-Api-Key": process.env.API_NINJAS_KEY
        }
      }
    );

    const fact = response.data?.[0]?.fact || "No fact found.";

    await respond({
      text: `*Did you know?*\n${fact}`
    });

  } catch (err) {
    console.error("Fact API error:", err.response?.data || err.message);

    await respond({
      text: "Failed to fetch a random fact."
    });
  }
});

//
// ❓ /chckn-help
//
app.command("/chckn-help", async ({ ack, respond }) => {
  await ack();

  await respond({
    text: `Available Commands:
• /chckn-ping - Check bot latency
• /chckn-randomfact - Get a random fact
• /chckn-coinflip - Flip a coin
• /chckn-echo [message] - Echo back your message
• /chckn-ai [question] - Talk to AI`
  });
});

//
// 🚀 Start bot
//
(async () => {
  await app.start();
  console.log("ChickenBot is running!");
})();