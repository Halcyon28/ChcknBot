require("dotenv").config();
const axios = require("axios");



console.log('BOT_TOKEN:', process.env.SLACK_BOT_TOKEN);
console.log('APP_TOKEN:', process.env.SLACK_APP_TOKEN);
const { App } = require("@slack/bolt");

const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  appToken: process.env.SLACK_APP_TOKEN,
  socketMode: true
});

app.command("/chckn-ping", async ({ command, ack, respond }) => {
  const start = Date.now();
  await ack();
  const latency = Date.now() - start;
  await respond({ text: `Pong!\nLatency: ${latency}ms` });
});


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

    const fact = response.data[0]?.fact;

    await respond({
      text: `*Did you know?*\n${fact}`
    });

  } catch (err) {
    console.error(err.response?.data || err.message);

    await respond({
      text: "Failed to fetch a random fact."
    });
  }
});


app.command("/chckn-help", async ({ ack, respond }) => {
  await ack();
  await respond({
    text:
`Available Commands:
/chckn-ping - Check bot latency
/chckn-randomfact - Get a random fact
/chckn-help - Show this help message`
  });
});




(async () => {
  await app.start();
  console.log("ChickenBot is running!");
})();