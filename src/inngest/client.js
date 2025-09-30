// inngest/client.ts
import { Inngest } from "inngest";

// Create a client to send and receive events
export const inngest = new Inngest({
  id: "vercel-inngest-nextjs-pg",
  name: "Vercel Inngest NextJS PG",
  eventKey: process.env.INNGEST_EVENT_KEY,
  apiKey: process.env.INNGEST_SIGNING_KEY,
});
