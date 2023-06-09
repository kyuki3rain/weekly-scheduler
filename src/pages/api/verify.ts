import { NextApiHandler } from 'next';
import qs from 'qs';

import { auth } from '@/lib/firebase/admin';

const verify: NextApiHandler = async (req, res) => {
  // id tokenを取得
  const idToken = req.body.idToken;

  // id tokenの有効性を検証する
  const response = await fetch('https://api.line.me/oauth2/v2.1/verify', {
    body: qs.stringify({
      client_id: process.env.LIFF_CHANNEL_ID,
      id_token: idToken,
    }),
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    method: 'POST',
  });
  const data = await response.json();

  if (response.status !== 200) {
    // IDトークンが有効ではない場合
    res.status(400).send(data.error);
    return;
  }

  // LINE IDでfirebaseトークンを発行して返却
  const token = await auth.createCustomToken(data.sub);
  res.status(200).send(token);
};

export default verify;
