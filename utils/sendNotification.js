import { Expo } from "expo-server-sdk";

const expo = new Expo();

export const sendPushNotification = async ({ to, title, body, sound = "default", data = {} }) => {
  const validTokens = to.filter((t) => Expo.isExpoPushToken(t));

  if (validTokens.length === 0) {
    console.error("Error: No valid Expo push tokens provided.");
    return;
  }

  const messages = validTokens.map((pushToken) => ({
    to: pushToken,
    sound: sound,
    title: title,
    body: body,
    data: typeof data === "object" ? data : { message: data },
  }));

  let tickets = [];
  let chunks = expo.chunkPushNotifications(messages);

  try {
    for (let chunk of chunks) {
      try {
        let ticketChunk = await expo.sendPushNotificationsAsync(chunk);
        console.log("✅ Tickets received (Sent to Expo):", ticketChunk);
        tickets.push(...ticketChunk);
      } catch (error) {
        console.error("❌ Error sending chunk", error);
      }
    }
  } catch (error) {
    console.error("❌ Critical Error", error);
  }

  return tickets;
};

// (async () => {
//   try {
//     await sendPushNotification({
//       to: ["ExponentPushToken[7lToBlISRi4TR9-YlsxXWj]"],
//       title: "Test Title",
//       body: "Test Body",
//       data: "This string will be auto-fixed",
//     });
//   } catch (err) {
//     console.log(err);
//   }
// })();
