"use client";

import { useEffect, useMemo, useState } from "react";
import {
  collection,
  limit,
  onSnapshot,
  orderBy,
  query,
  Timestamp,
  where,
  type QueryDocumentSnapshot,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

export type NotificationType = "DealAssigned" | "DealMoved" | "TicketCreated";

export interface NotificationItem {
  id: string;
  organizationId: string;
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  contextUrl: string;
  isRead: boolean;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

function toDate(value: unknown): Date {
  if (value instanceof Timestamp) return value.toDate();
  if (value instanceof Date) return value;
  if (typeof value === "string" || typeof value === "number") return new Date(value);
  return new Date();
}

function mapNotification(doc: QueryDocumentSnapshot): NotificationItem {
  const data = doc.data();
  return {
    id: doc.id,
    organizationId: String(data.organizationId ?? ""),
    userId: String(data.userId ?? ""),
    type: data.type as NotificationType,
    title: String(data.title ?? ""),
    body: String(data.body ?? ""),
    contextUrl: String(data.contextUrl ?? ""),
    isRead: Boolean(data.isRead),
    isDeleted: Boolean(data.isDeleted),
    createdAt: toDate(data.createdAt),
    updatedAt: toDate(data.updatedAt),
  };
}

export function useNotifications(organizationId?: string, userId?: string) {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!organizationId || !userId) {
      setNotifications([]);
      setLoading(false);
      return;
    }

    const itemsRef = collection(db, "notifications", organizationId, "items");
    const q = query(
      itemsRef,
      where("userId", "==", userId),
      orderBy("createdAt", "desc"),
      limit(50)
    );

    setLoading(true);

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const items = snapshot.docs
          .map(mapNotification)
          .filter((n) => !n.isDeleted);
        setNotifications(items);
        setLoading(false);
      },
      (error) => {
        console.error("[useNotifications] Firestore subscription failed:", error);
        setNotifications([]);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [organizationId, userId]);

  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.isRead).length,
    [notifications]
  );

  return { notifications, unreadCount, loading };
}
