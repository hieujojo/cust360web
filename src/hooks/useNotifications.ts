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

export function useNotifications(
  organizationId?: string,
  userId?: string,
  isOpen = false   // ← thêm param
) {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  // Subscription 1: chỉ đếm unread — nhẹ, luôn chạy
  useEffect(() => {
    if (!organizationId || !userId) return;

    const itemsRef = collection(db, "notifications", organizationId, "items");
    const q = query(
      itemsRef,
      where("userId", "==", userId),
      where("isRead", "==", false),  // chỉ lấy unread
      where("isDeleted", "==", false),
      limit(1)  // chỉ cần biết có hay không, hoặc dùng count()
    );

    const unsub = onSnapshot(q, { includeMetadataChanges: false }, (snap) => {
      setUnreadCount(snap.size);
    });

    return () => unsub();
  }, [organizationId, userId]);

  // Subscription 2: full list — chỉ chạy khi dropdown mở
  useEffect(() => {
    if (!organizationId || !userId || !isOpen) {
      if (!isOpen) setLoading(false);
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
    const unsub = onSnapshot(q, { includeMetadataChanges: false }, (snap) => {
      setNotifications(
        snap.docs.map(mapNotification).filter((n) => !n.isDeleted)
      );
      setLoading(false);
    });

    return () => unsub();
  }, [organizationId, userId, isOpen]);

  return { notifications, unreadCount, loading };
}
