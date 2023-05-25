import * as line from '@line/bot-sdk';
import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';
import { DateTime } from 'luxon';

admin.initializeApp();
const db = admin.firestore();

const termToText = (term: number) => {
  switch (term) {
    case 0:
      return '朝';
    case 1:
      return '昼';
    case 2:
      return '夜';
    default:
      return '不明';
  }
};

const statusToText = (status: number) => {
  if (status > 0) return '〇';
  else if (status < 0) return '×';

  return '△';
};

export const weekendReminder = functions.pubsub
  .schedule('every sunday 20:00')
  .timeZone('Asia/Tokyo')
  .onRun(async () => {
    const client = new line.Client({
      channelAccessToken: functions.config().linebot.token,
    });

    const users = await db.collectionGroup('users').get();
    users.forEach((user) => {
      if (user.data().project_id === undefined) return;

      const projectUrl = `https://liff.line.me/1660899922-RzNjQDvX/projects/${
        user.data().project_id
      }/`;

      const message: line.TextMessage = {
        text: `以下のURLから、今週の分を登録してください！\n\n${projectUrl}`,
        type: 'text',
      };

      client
        .pushMessage(user.id, message)
        .then(() => {
          functions.logger.log('Replied to the message!');
        })
        .catch((err) => {
          functions.logger.error(err);
        });
    });
  });

export const onChangeTodayTerm = functions.firestore
  .document('projects/{project_id}/users/{user_id}/dates/{date}/terms/{term}')
  .onWrite(async (change, context) => {
    const today = DateTime.local().setZone('Asia/Tokyo').toISODate();

    if (change.after.data()?.date !== today) return;

    functions.logger.log('onChangeTodayTerm', context.params, 'is called!');

    const client = new line.Client({
      channelAccessToken: functions.config().linebot.token,
    });

    const projectId = context.params.project_id;
    const adminUsers = await db
      .collection('projects')
      .doc(projectId)
      .collection('users')
      .where('admin', '==', true)
      .get();

    const changeUser = await db
      .collection('projects')
      .doc(projectId)
      .collection('users')
      .doc(context.params.user_id)
      .get();
    const projectUrl = `https://liff.line.me/1660899922-RzNjQDvX/projects/${projectId}/`;

    const termText = termToText(change.after.data()?.term);

    const message: line.TextMessage = {
      text: `「${
        changeUser.data()?.name
      }」さんが本日の予定を変更しました。\n\n${today} ${termText}\n${statusToText(
        change.before.data()?.status
      )} -> ${statusToText(change.after.data()?.status)}\n\n${projectUrl}`,
      type: 'text',
    };

    functions.logger.log(message.text);

    adminUsers.forEach((adminUser) => {
      functions.logger.log(
        'send to',
        adminUser.data()?.name,
        ' (',
        adminUser.id,
        ')'
      );

      client
        .pushMessage(adminUser.id, message)
        .then(() => {
          functions.logger.log('Replied to the message!');
        })
        .catch((err) => {
          functions.logger.error(err);
        });
    });
  });
