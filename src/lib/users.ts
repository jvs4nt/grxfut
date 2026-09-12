import { asc, eq } from "drizzle-orm";
import { getDb } from "@/db";
import { users } from "@/db/schema";
import { hashPassword } from "@/lib/auth";
import type { UserRole, UserTier } from "@/lib/labels";

export type PublicUser = {
  id: string;
  username: string;
  name: string;
  role: UserRole;
  tier: UserTier;
};

const publicUserColumns = {
  id: users.id,
  username: users.username,
  name: users.name,
  role: users.role,
  tier: users.tier,
};

export async function listUsers(): Promise<PublicUser[]> {
  const db = getDb();
  return db
    .select(publicUserColumns)
    .from(users)
    .orderBy(asc(users.tier), asc(users.name));
}

export async function createUser(input: {
  username: string;
  name: string;
  password: string;
  role: UserRole;
  tier: UserTier;
}) {
  const db = getDb();
  const passwordHash = await hashPassword(input.password);

  try {
    const [user] = await db
      .insert(users)
      .values({
        username: input.username,
        name: input.name,
        passwordHash,
        role: input.role,
        tier: input.tier,
      })
      .returning(publicUserColumns);

    return { ok: true as const, user };
  } catch (error) {
    if (isUniqueViolation(error)) {
      return { ok: false as const, error: "duplicate" };
    }

    throw error;
  }
}

export async function updateUserTier(userId: string, tier: UserTier) {
  const db = getDb();
  const [user] = await db
    .update(users)
    .set({ tier })
    .where(eq(users.id, userId))
    .returning(publicUserColumns);

  return user ?? null;
}

export async function updateMemberUser(input: {
  userId: string;
  username: string;
  name: string;
  password?: string;
  actorId: string;
}) {
  const db = getDb();
  const [existing] = await db
    .select({ id: users.id, role: users.role })
    .from(users)
    .where(eq(users.id, input.userId))
    .limit(1);

  const isSelf = existing?.id === input.actorId;

  if (!existing || (existing.role !== "member" && !isSelf)) {
    return { ok: false as const, error: "not_allowed" as const };
  }

  const values: { username: string; name: string; passwordHash?: string } = {
    username: input.username,
    name: input.name,
  };

  if (input.password) {
    values.passwordHash = await hashPassword(input.password);
  }

  try {
    const [user] = await db
      .update(users)
      .set(values)
      .where(eq(users.id, input.userId))
      .returning(publicUserColumns);

    if (!user) {
      return { ok: false as const, error: "not_allowed" as const };
    }

    return { ok: true as const, user };
  } catch (error) {
    if (isUniqueViolation(error)) {
      return { ok: false as const, error: "duplicate" as const };
    }

    throw error;
  }
}

export async function deleteMemberUser(userId: string) {
  const db = getDb();
  const [user] = await db
    .select({ id: users.id, role: users.role })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  if (!user || user.role !== "member") {
    return { ok: false as const, error: "not_allowed" as const };
  }

  await db.delete(users).where(eq(users.id, userId));

  return { ok: true as const };
}

function isUniqueViolation(error: unknown) {
  if (typeof error !== "object" || error === null) {
    return false;
  }

  const code = "code" in error ? String(error.code) : "";
  const message = "message" in error ? String(error.message) : "";
  return code === "23505" || /unique|duplicate/i.test(message);
}
