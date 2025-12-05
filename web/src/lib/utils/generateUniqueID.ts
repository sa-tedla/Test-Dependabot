import { customAlphabet } from 'nanoid';

export const generateUniqueID = (): string => {
  // https://akerun.hateblo.jp/entry/2020/12/22
  const alphabet = '23456789ABCDEFGHJKLMNPQRSTUVWYZabcdeghkmnpqrsuvwyz';
  const nanoid = customAlphabet(alphabet, 11);
  return nanoid();
};
