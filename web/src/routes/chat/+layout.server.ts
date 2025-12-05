import type { LayoutServerLoad } from './$types';
import { redirect } from '@sveltejs/kit';

export const load = (() => {
  redirect(301, `/assistant`);
}) satisfies LayoutServerLoad;
