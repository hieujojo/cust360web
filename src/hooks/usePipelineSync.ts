"use client";

import { useEffect, useState } from "react";
import {
  collection,
  onSnapshot,
  Timestamp,
  type QueryDocumentSnapshot,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

export interface PipelineEvent {
  id: string;
  organizationId: string;
  dealId: string;
  stage: string;
  previousStage?: string;
  changedBy?: string;
  createdAt: Date;
}

function toDate(value: unknown): Date {
  if (value instanceof Timestamp) return value.toDate();
  if (value instanceof Date) return value;
  if (typeof value === "string" || typeof value === "number") return new Date(value);
  return new Date();
}

function mapPipelineEvent(doc: QueryDocumentSnapshot): PipelineEvent {
  const data = doc.data();
  return {
    id: doc.id,
    organizationId: String(data.organizationId ?? ""),
    dealId: String(data.dealId ?? ""),
    stage: String(data.stage ?? ""),
    previousStage: data.previousStage != null ? String(data.previousStage) : undefined,
    changedBy: data.changedBy != null ? String(data.changedBy) : undefined,
    createdAt: toDate(data.createdAt),
  };
}

export function usePipelineSync(organizationId?: string) {
  const [latestEvent, setLatestEvent] = useState<PipelineEvent | null>(null);

  useEffect(() => {
    if (!organizationId) {
      setLatestEvent(null);
      return;
    }

    const eventsRef = collection(db, "pipeline_events", organizationId, "events");
    let isInitialSnapshot = true;

    const unsubscribe = onSnapshot(
      eventsRef,
      (snapshot) => {
        if (isInitialSnapshot) {
          isInitialSnapshot = false;
          return;
        }

        for (const change of snapshot.docChanges()) {
          if (change.type !== "added") continue;
          setLatestEvent(mapPipelineEvent(change.doc));
        }
      },
      (error) => {
        console.error("[usePipelineSync] Firestore subscription failed:", error);
      }
    );

    return () => unsubscribe();
  }, [organizationId]);

  return { latestEvent };
}
