import sql from 'mssql';
import { env } from '$env/dynamic/private';
import { unserialize } from 'php-serialize';

const sqlConfig = {
  user: env.OC_PORTAL_DB_USER_NAME,
  password: env.OC_PORTAL_DB_PASSWORD,
  database: env.OC_PORTAL_DB_DATABASE,
  server: env.OC_PORTAL_DB_SERVER,
  options: {
    encrypt: true,
    trustServerCertificate: false,
  },
};

if (['staging', 'production'].includes(env.APP_ENVIRONMENT)) {
  await sql.connect(sqlConfig);
}

export const getPortalUserEmail = async (sessionKey: string): Promise<string | undefined> => {
  const query = `select payload
                 from sessions
                 where id = '${sessionKey}'`;
  const result = await sql.query(query);
  if (result.recordset.length === 0) {
    return undefined;
  }
  const payload = result.recordset[0]['payload'];
  const buf = Buffer.from(payload, 'base64');
  const butString = buf.toString('utf-8');
  return unserialize(butString)['user']['mail'];
};
