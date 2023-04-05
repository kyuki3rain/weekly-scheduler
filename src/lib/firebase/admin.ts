import admin, { ServiceAccount } from 'firebase-admin';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

export const app = admin.apps?.length
  ? admin.apps[0]
  : admin.initializeApp({
      credential: admin.credential.cert({
        auth_provider_x509_cert_url:
          process.env.FIREBASE_AUTH_PROVIDER_X509_CERT_URL,
        auth_uri: process.env.FIREBASE_AUTH_URI,
        client_email: process.env.FIREBASE_CLIENT_EMAIL,
        client_id: process.env.FIREBASE_CLIENT_ID,
        client_x509_cert_url: process.env.FIREBASE_CLIENT_X509_CERT_URL,
        private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/gm, '\n'), // https://github.com/gladly-team/next-firebase-auth/discussions/95#discussioncomment-473663
        private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
        project_id: process.env.FIREBASE_PROJECT_ID,
        token_uri: process.env.FIREBASE_TOKEN_URI,
        type: process.env.FIREBASE_TYPE,
      } as ServiceAccount),
    });
export const auth = getAuth();
export const db = getFirestore();
