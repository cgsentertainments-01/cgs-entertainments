"use client";

import React from "react";
import { useParams } from "next/navigation";
import { EventForm } from "@/components/events/EventForm";

export default function AdminEventsEditPage() {
  const params = useParams();
  const eventId = (params?.id as string) || "";

  return <EventForm mode="edit" eventId={eventId} />;
}
