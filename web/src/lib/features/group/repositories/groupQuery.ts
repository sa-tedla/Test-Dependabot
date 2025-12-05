import type { Prisma, PrismaClient, UserGroupRelation } from '@prisma/client';
import type { Group } from '$lib/entities';

export async function findUserGroupRelationsByUserID(
  db: PrismaClient,
  userId: string
): Promise<UserGroupRelation[]> {
  return db.userGroupRelation.findMany({
    where: {
      userId: userId,
    },
  });
}

export async function findGroupByUserID(
  db: Prisma.TransactionClient,
  userId: string
): Promise<Group[]> {
  const userGroups = await db.userGroupRelation.findMany({
    where: {
      userId: userId,
    },
    include: {
      group: true,
    },
  });
  return userGroups.map((ug) => ug.group);
}
