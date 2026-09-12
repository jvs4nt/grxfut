import { date, pgEnum, pgTable, text, time, timestamp, unique, uuid } from "drizzle-orm/pg-core";

export const userRoleEnum = pgEnum("user_role", ["admin", "member"]);
export const userTierEnum = pgEnum("user_tier", ["capitao", "tenente", "soldado"]);
export const matchStatusEnum = pgEnum("match_status", ["scheduled", "rest"]);
export const attendanceStatusEnum = pgEnum("attendance_status", [
  "confirmed",
  "reserve",
]);
export const paymentStatusEnum = pgEnum("payment_status", [
  "calote",
  "agendado",
  "pago",
]);
export const drawTeamEnum = pgEnum("draw_team", [
  "team_a",
  "team_b",
  "draw_reserve",
]);

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  username: text("username").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  role: userRoleEnum("role").notNull(),
  tier: userTierEnum("tier").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const matches = pgTable("matches", {
  id: uuid("id").defaultRandom().primaryKey(),
  date: date("date").notNull(),
  time: time("time"),
  location: text("location"),
  status: matchStatusEnum("status").notNull().default("scheduled"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const attendances = pgTable(
  "attendances",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    matchId: uuid("match_id")
      .notNull()
      .references(() => matches.id, { onDelete: "cascade" }),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    status: attendanceStatusEnum("status").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [unique("attendances_match_user_unique").on(table.matchId, table.userId)],
);

export const payments = pgTable(
  "payments",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    matchId: uuid("match_id")
      .notNull()
      .references(() => matches.id, { onDelete: "cascade" }),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    status: paymentStatusEnum("status").notNull().default("calote"),
    scheduledOn: date("scheduled_on"),
  },
  (table) => [unique("payments_match_user_unique").on(table.matchId, table.userId)],
);

export const draws = pgTable("draws", {
  id: uuid("id").defaultRandom().primaryKey(),
  matchId: uuid("match_id")
    .notNull()
    .unique()
    .references(() => matches.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const drawPlayers = pgTable(
  "draw_players",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    drawId: uuid("draw_id")
      .notNull()
      .references(() => draws.id, { onDelete: "cascade" }),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    team: drawTeamEnum("team").notNull(),
  },
  (table) => [unique("draw_players_draw_user_unique").on(table.drawId, table.userId)],
);
