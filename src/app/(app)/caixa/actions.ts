"use server";

import { revalidatePath } from "next/cache";
import { getDb } from "@/db";
import { fundBalance, fundTransactions } from "@/db/schema";
import { requireSession, isAdmin } from "@/lib/auth";
import { eq } from "drizzle-orm";

export async function addFundsAction(formData: FormData) {
  const user = await requireSession();
  if (!isAdmin(user)) {
    throw new Error("Unauthorized");
  }

  const amountStr = formData.get("amount") as string;
  const description = formData.get("description") as string;
  
  if (!amountStr || !description) {
    throw new Error("Missing fields");
  }

  // Parse amount, assume it might be a float like "10.50" or integer.
  // Converting to cents
  const amount = Math.round(parseFloat(amountStr.replace(",", ".")) * 100);
  
  if (isNaN(amount) || amount <= 0) {
    throw new Error("Invalid amount");
  }

  const db = getDb();
  
  // get current balance
  const [current] = await db.select().from(fundBalance).limit(1);
  
  let newBalance = amount;
  if (current) {
    newBalance = current.balance + amount;
    await db.update(fundBalance).set({ balance: newBalance, updatedAt: new Date() }).where(eq(fundBalance.id, current.id));
  } else {
    await db.insert(fundBalance).values({ balance: newBalance });
  }

  await db.insert(fundTransactions).values({
    amount: amount,
    type: "add",
    description: description,
    createdBy: user.id,
  });

  revalidatePath("/caixa");
}

export async function removeFundsAction(formData: FormData) {
  const user = await requireSession();
  if (!isAdmin(user)) {
    throw new Error("Unauthorized");
  }

  const amountStr = formData.get("amount") as string;
  const description = formData.get("description") as string;
  
  if (!amountStr || !description) {
    throw new Error("Missing fields");
  }

  const amount = Math.round(parseFloat(amountStr.replace(",", ".")) * 100);
  
  if (isNaN(amount) || amount <= 0) {
    throw new Error("Invalid amount");
  }

  const db = getDb();
  
  const [current] = await db.select().from(fundBalance).limit(1);
  
  let newBalance = -amount;
  if (current) {
    newBalance = current.balance - amount;
    await db.update(fundBalance).set({ balance: newBalance, updatedAt: new Date() }).where(eq(fundBalance.id, current.id));
  } else {
    await db.insert(fundBalance).values({ balance: newBalance });
  }

  await db.insert(fundTransactions).values({
    amount: amount,
    type: "remove",
    description: description,
    createdBy: user.id,
  });

  revalidatePath("/caixa");
}

export async function updateBalanceAction(formData: FormData) {
  const user = await requireSession();
  if (!isAdmin(user)) {
    throw new Error("Unauthorized");
  }

  const amountStr = formData.get("amount") as string;
  
  if (!amountStr) {
    throw new Error("Missing amount");
  }

  const newBalance = Math.round(parseFloat(amountStr.replace(",", ".")) * 100);
  
  if (isNaN(newBalance)) {
    throw new Error("Invalid amount");
  }

  const db = getDb();
  
  const [current] = await db.select().from(fundBalance).limit(1);
  
  let oldBalance = 0;
  if (current) {
    oldBalance = current.balance;
    await db.update(fundBalance).set({ balance: newBalance, updatedAt: new Date() }).where(eq(fundBalance.id, current.id));
  } else {
    await db.insert(fundBalance).values({ balance: newBalance });
  }

  const diff = newBalance - oldBalance;
  const type = diff >= 0 ? "add" : "remove";
  await db.insert(fundTransactions).values({
    amount: diff,
    type: "edit",
    description: `Ajuste manual de R$ ${(oldBalance / 100).toFixed(2)} para R$ ${(newBalance / 100).toFixed(2)}`,
    createdBy: user.id,
  });

  revalidatePath("/caixa");
}
