import { Expo } from "expo-server-sdk";
const expo = new Expo();

export const sendPushNotification = async ({ to, title, body, sound = "default", data }) => {
  let messages = [];

  for (let pushToken of to) {
    if (!Expo.isExpoPushToken(pushToken)) {
      console.error(`invalid token ${pushToken}`);
      continue;
    }

    messages.push({
      to: pushToken,
      sound: sound,
      title: title,
      body: body,
      data: data,
    });
  }

  try {
    const tickets = await expo.sendPushNotificationsAsync(messages);
    console.log("Tiket notifikasi diterima:", tickets);

    // tickets.forEach((ticket) => {
    //   if (ticket.status === "error") {
    //     console.error(`Error saat mengirim ke token: ${ticket.message}`);
    //     if (ticket.details && ticket.details.error) {
    //       if (ticket.details.error === "DeviceNotRegistered") {
    //         console.warn(`Token ${ticket.to} tidak terdaftar. Hapus dari DB.`);
    //       }
    //     }
    //   }
    // });

    return tickets;
  } catch (error) {
    console.error("Error notif", error);
  }
};
