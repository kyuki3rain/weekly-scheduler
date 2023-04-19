import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import * as line from "@line/bot-sdk";
import { DateTime } from "luxon";

admin.initializeApp();
const db = admin.firestore();

export const weekendReminder = functions.pubsub
  .schedule("every sunday 20:00")
  .timeZone("Asia/Tokyo")
  .onRun(async () => {
    const client = new line.Client({
      channelAccessToken: functions.config().linebot.token,
    });

    const users = await db.collectionGroup("users").get();
    users.forEach((user) => {
      if (user.data().project_id === undefined) return;

      const projectUrl = `https://liff.line.me/1660899922-RzNjQDvX/projects/${
        user.data().project_id
      }/`;

      const message: line.TextMessage = {
        type: "text",
        text: `以下のURLから、今週の分を登録してください！\n\n${projectUrl}`,
      };

      client
        .pushMessage(user.id, message)
        .then(() => {
          functions.logger.log("Replied to the message!");
        })
        .catch((err) => {
          functions.logger.error(err);
        });
    });
  });

export const onChangeTodayTerm = functions.firestore
  .document("projects/{project_id}/users/{user_id}/dates/{date}/terms/{term}")
  .onWrite(async (change, context) => {
    const today = DateTime.now().toISODate();

    if (change.after.data()?.date !== today) return;

    functions.logger.log("onChangeTodayTerm", context.params, "is called!");

    const client = new line.Client({
      channelAccessToken: functions.config().linebot.token,
    });

    const projectId = context.params.project_id;
    const adminUsers = await db
      .collection("projects")
      .doc(projectId)
      .collection("users")
      .where("admin", "==", true)
      .get();

    adminUsers.forEach((adminUser) => {
      functions.logger.log("send to", adminUser.id);
      const projectUrl = `https://liff.line.me/1660899922-RzNjQDvX/projects/${projectId}/`;

      const message: line.TextMessage = {
        type: "text",
        text: `${today}\n当日分の変更がありました。\n${projectUrl}`,
      };

      client
        .pushMessage(adminUser.id, message)
        .then(() => {
          functions.logger.log("Replied to the message!");
        })
        .catch((err) => {
          functions.logger.error(err);
        });
    });
  });
