import { redirect } from "next/navigation";
import { getDb } from "@/db";
import { fundBalance, fundTransactions, users } from "@/db/schema";
import { requireSession, isAdmin } from "@/lib/auth";
import { CaixaClient } from "./client";
import { desc, eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export default async function CaixaPage() {
  const user = await requireSession();

  if (user.role === "guest") {
    redirect("/");
  }

  const db = getDb();
  
  // Get current balance
  const [balanceRecord] = await db.select().from(fundBalance).limit(1);
  const currentBalance = balanceRecord ? balanceRecord.balance : 0;

  // Get last 10 transactions with user names
  const history = await db
    .select({
      id: fundTransactions.id,
      amount: fundTransactions.amount,
      type: fundTransactions.type,
      description: fundTransactions.description,
      createdAt: fundTransactions.createdAt,
      creatorName: users.name,
    })
    .from(fundTransactions)
    .leftJoin(users, eq(fundTransactions.createdBy, users.id))
    .orderBy(desc(fundTransactions.createdAt))
    .limit(10);

  return (
    <CaixaClient 
      balance={currentBalance} 
      transactions={history} 
      isAdmin={isAdmin(user)} 
    />
  );
}
