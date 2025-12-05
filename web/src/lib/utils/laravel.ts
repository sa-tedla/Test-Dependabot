// ポータルサイトとログイン情報をCookieで共有している
// ポータルサイトは、Laravelで実装されている
// Laravelで実装されている暗号化等の処理を再現する
import * as crypto from 'crypto';

const APP_KEY = 'sY3o0I0VC8gqdurXJUxC/6uCimSopogAQF0+wWPNIGc=';

// SessionDBを仮想的に実現するオブジェクト郡
const DUMMY_ACCOUNT_ID_1 = 'd54391a8-5089-6151-38f7-468d02e9aa23';
const DUMMY_ACCOUNT_ID_2 = '56230948-630f-6311-7ae2-2b5320d48d1f';
const DUMMY_ACCOUNT_ID_3 = 'a47c9862-6ce8-7d24-b606-6ddd54707f82';
const DUMMY_SESSION_KEY_1 = 'URvsAZ9h5V5y4wMLXajMrNKRt8NP3KHnYW3tZto7';
const DUMMY_SESSION_KEY_2 = '23vgqnqASRuPSDJ2Rb2FFYJMhLkoKL85Eb63ecWb';
const DUMMY_SESSION_KEY_3 = 'bpgjHwciUg8nBtgTkoT4m6BJNLK8aBPgAaCUnizr';
const USER_ID_1 = '36LWuUdZCs7';
const USER_ID_2 = 'y49PcVNw9TF';
const USER_ID_3 = 'bpYQDPzFLcq';
export const DUMMY_ACCOUNT_ID_SESSION_MAP = new Map([
  [DUMMY_ACCOUNT_ID_1, DUMMY_SESSION_KEY_1],
  [DUMMY_ACCOUNT_ID_2, DUMMY_SESSION_KEY_2],
  [DUMMY_ACCOUNT_ID_3, DUMMY_SESSION_KEY_3],
]);
export const DUMMY_SESSOIN_USER_ID_MAP = new Map([
  [DUMMY_SESSION_KEY_1, USER_ID_1],
  [DUMMY_SESSION_KEY_2, USER_ID_2],
  [DUMMY_SESSION_KEY_3, USER_ID_3],
]);

export const laravelEncrypt = (sessionKey: string): string => {
  const iv = crypto.randomBytes(16);
  const message = `s:${sessionKey.length}:${sessionKey}`;

  const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(APP_KEY, 'base64'), iv);
  let encrypted = cipher.update(message, 'utf8');
  encrypted = Buffer.concat([encrypted, cipher.final()]);

  const encryptedDataStructure = {
    iv: iv.toString('base64'),
    value: encrypted.toString('base64'),
  };

  return Buffer.from(JSON.stringify(encryptedDataStructure)).toString('base64');
};

export const laravelDecrypt = (cookieValue: string): string => {
  const decodedDataBuffer = Buffer.from(cookieValue, 'base64');

  const jsonData = JSON.parse(decodedDataBuffer.toString('utf-8'));

  const iv = Buffer.from(jsonData['iv'], 'base64');
  const encryptedValue = Buffer.from(jsonData['value'], 'base64');

  const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(APP_KEY, 'base64'), iv);
  let decrypted = decipher.update(encryptedValue);
  decrypted = Buffer.concat([decrypted, decipher.final()]);

  const message = decrypted.toString('utf-8');

  if (message.split(':').length == 3) {
    return message.split(':')[2];
  }
  if (message.split('|').length == 2) {
    return message.split('|')[1];
  }

  return '';
};
