import { db } from "../firebase/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

export const sendNotification = async ({
  toUserId,
  message,
  type,
  fromUserId,
  relatedDealId,
  dealId,
  influenceurId,
  targetRoute,
  chatId,
  receiverId,
}: {
  toUserId: string;
  message: string;
  type: string;
  fromUserId: string;
  relatedDealId?: string;
  targetRoute?: string;
  dealId?: string;
  influenceurId?: string;
  chatId?: string;
  receiverId?: string;
}) => {
  try {
    const notifRef = collection(db, "users", toUserId, "notifications");
    await addDoc(notifRef, {
      message,
      type,
      fromUserId,
      relatedDealId: relatedDealId || null,
      targetRoute: targetRoute || null,
      dealId: dealId || null,
      influenceurId: influenceurId || null,
      chatId: chatId || null,
      read: false,
      createdAt: serverTimestamp(),
      receiverId,
    });
  } catch (error) {
    console.error("Erreur lors de l'envoi de la notification :", error);
  }
};

export const sendNotificationToToken = async (token: string, title: string, body: string, data?: any) => {
  await fetch("https://exp.host/--/api/v2/push/send", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Accept-encoding": "gzip, deflate",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      to: token,
      sound: "default",
      title,
      body,
      data,
    }),
  });
};
