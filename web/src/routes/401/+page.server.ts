import type { PageServerLoad } from './$types';
import type { Actions } from '@sveltejs/kit';
import { fail, redirect } from '@sveltejs/kit';
import { superValidate } from 'sveltekit-superforms/server';
import { DUMMY_ACCOUNT_ID_SESSION_MAP, laravelEncrypt } from '$lib/utils/laravel';
import { env } from '$env/dynamic/private';
import { zod } from 'sveltekit-superforms/adapters';
import { developerLoginSchema } from '$lib/schema';

export const load = (async () => {
  const form = await superValidate(zod(developerLoginSchema));
  return {
    form,
    showAccountLogin: env.APP_ENVIRONMENT !== 'production',
  };
}) satisfies PageServerLoad;

export const actions: Actions = {
  default: async ({ request, cookies }) => {
    const form = await superValidate(request, zod(developerLoginSchema));

    if (!form.valid) {
      return fail(400, { form });
    }

    const sessionKey = DUMMY_ACCOUNT_ID_SESSION_MAP.get(form.data.accountID);
    if (!sessionKey) {
      form.errors.accountID = ['指定されたaccountIDは存在しません。'];
      return fail(400, { form });
    }

    const cookieValue = laravelEncrypt(sessionKey);
    cookies.set('laravel_session', cookieValue, {
      path: '/',
    });

    redirect(302, '/');
  },
};
