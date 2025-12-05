import { sequence } from '@sveltejs/kit/hooks';
import * as Sentry from '@sentry/sveltekit';
import type { Handle, RequestEvent } from '@sveltejs/kit';
import { DUMMY_SESSOIN_USER_ID_MAP, laravelDecrypt } from '$lib/utils/laravel';
import { env } from '$env/dynamic/private';
import { env as publicEnv } from '$env/dynamic/public';
import { prisma } from '$lib/prisma';
// import { getPortalUserEmail } from '$lib/sqlserver';
import { generateUniqueID } from '$lib/utils/generateUniqueID';

if (publicEnv.PUBLIC_SENTRY_ENVIRONMENT && publicEnv.PUBLIC_SENTRY_ENVIRONMENT !== 'local') {
  Sentry.init({
    dsn: publicEnv.PUBLIC_SENTRY_DSN,
    tracesSampleRate: publicEnv.PUBLIC_SENTRY_ENVIRONMENT === 'production' ? 0.2 : 0,
    environment: publicEnv.PUBLIC_SENTRY_ENVIRONMENT,
  });
}

const respondUnauthorize = (location: string, event?: RequestEvent, reason?: string) => {
  // Sentryに401エラーの詳細情報を送信
  if (event) {
    // Sentryが初期化されている場合のみ送信
    try {
      const url = new URL(event.request.url);
      const userAgent = event.request.headers.get('user-agent') || 'unknown';
      const referer = event.request.headers.get('referer') || 'none';
      const sessionCookie = event.cookies.get('laravel_session');

      Sentry.captureMessage('Unauthorized Access (401)', {
        level: 'error',
        tags: {
          error_type: '401_unauthorized',
          redirect_location: location,
        },
        extra: {
          url: url.href,
          pathname: url.pathname,
          search_params: url.search,
          user_agent: userAgent,
          referer: referer,
          has_session_cookie: !!sessionCookie,
          session_cookie_length: sessionCookie ? sessionCookie.length : 0,
          reason: reason || 'unknown',
          timestamp: new Date().toISOString(),
          app_environment: env.APP_ENVIRONMENT,
        },
        user: {
          ip_address: event.getClientAddress(),
        },
        fingerprint: ['401_unauthorized', reason || 'unknown', url.pathname],
      });
    } catch (error) {
      // Sentryが初期化されていない場合は無視
      console.warn('Sentry not initialized, skipping 401 error capture');
    }
  }

  return new Response('Unauthorized', {
    status: 302,
    headers: {
      Location: location,
    },
  });
};

export const handle: Handle = sequence(Sentry.sentryHandle(), async ({ event, resolve }) => {
  const url = new URL(event.request.url);
  // Ignore favicon requests
  if (url.pathname === '/favicon.ico') {
    return resolve(event);
  }

  const islocal = !['staging', 'production'].includes(env.APP_ENVIRONMENT);

  // ログアウトページは、何もしない
  if (url.pathname.startsWith('/logout')) {
    return resolve(event);
  }
  if (url.pathname.startsWith('/403')) {
    return resolve(event);
  }
  if (url.pathname.startsWith('/401')) {
    return resolve(event);
  }

  // トークンパラメータからemailを取得、またはクッキーから復元
  let email = url.searchParams.get('token');

  if (email) {
    // トークンパラメータがある場合、クッキーに保存
    const cookieOptions = {
      path: '/',
      sameSite: islocal ? 'lax' : 'none', // ローカルではlax、本番ではnone
      secure: !islocal, // ローカルではfalse、本番ではtrue
      httpOnly: true,
      maxAge: 60 * 60 * 24 * 7, // 7日間
    } as const;

    event.cookies.set('oc-ai-chatbot-email', email, cookieOptions);
  } else {
    // トークンパラメータがない場合、クッキーから復元
    email = event.cookies.get('oc-ai-chatbot-email') || null;
  }

  let sessionCookie = event.cookies.get('laravel_session');

  // Portalサイトからauthのパラメータを使ってリダイレクトされる
  const auth = url.searchParams.get('auth');
  if (!islocal && auth) {
    event.cookies.set('laravel_session', auth, {
      path: '/',
      // IframeをまたいだリクエストはsameSite: 'none'ではないとクッキーがセットされない
      sameSite: 'none',
    });
    sessionCookie = auth;
  }

  // クッキーがない場合、Unauthorized
  if (!sessionCookie) {
    return respondUnauthorize('/401', event, 'no_session_cookie');
  }

  let userId: undefined | string = undefined;
  const sessionKey = laravelDecrypt(sessionCookie).trim();

  // ステージング、ローカルの場合は、開発用アカウントでのアクセスを許可する
  if (['staging', 'local'].includes(env.APP_ENVIRONMENT)) {
    userId = DUMMY_SESSOIN_USER_ID_MAP.get(sessionKey);
    if (env.APP_ENVIRONMENT === 'local' && !userId) {
      return respondUnauthorize('/logout', event, 'local_dummy_user_not_found');
    } else if (userId) {
      event.locals.userId = userId;
      return resolve(event);
    }
  }

  if (['staging', 'production'].includes(env.APP_ENVIRONMENT)) {
    // let email = await getPortalUserEmail(sessionKey);

    // emailが設定されていない場合は共有アカウントを使用
    if (!email) {
      // email = url.searchParams.get('token') || 'hellokitty@example.com';
      // return respondUnauthorize('/401', event, 'portal_user_email_not_found');
      email = 'hellokitty@example.com';

      // 共有アカウントを使用する場合はクッキーにも保存
      const cookieOptions = {
        path: '/',
        sameSite: islocal ? 'lax' : 'none', // ローカルではlax、本番ではnone
        secure: !islocal, // ローカルではfalse、本番ではtrue
        httpOnly: true,
        maxAge: 60 * 60 * 24 * 7, // 7日間
      } as const;

      event.cookies.set('oc-ai-chatbot-email', email, cookieOptions);
    }
    const user = await prisma.user.findUnique({
      where: {
        email: email,
      },
    });

    // アクセスされたタイミングでユーザが存在しなければ作る
    if (!user) {
      userId = generateUniqueID();
      await prisma.user.create({
        data: {
          id: userId,
          email: email,
        },
      });
    } else {
      userId = user.id;
    }
  }

  if (!userId) {
    return respondUnauthorize('/401', event, 'user_id_not_determined');
  }
  event.locals.userId = userId;

  return resolve(event);
});

export const handleError = Sentry.handleErrorWithSentry();
