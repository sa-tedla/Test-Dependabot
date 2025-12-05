import type { LayoutServerLoad } from './$types';

export const load = (async ({ cookies }) => {
  const laravel_session = cookies.get('laravel_session');
  return {
    laravel_session: laravel_session,
  };
}) satisfies LayoutServerLoad;
