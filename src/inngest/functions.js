import { inngest } from "./client";

export const runIt = inngest.createFunction(
    { id: "user-onboarding-communication" },
    { event: "file-upload-event" },
    async ({ event, step }) => {
        await step.run("Send welcome email", async () => {
        await sendEmail({
            email: event.data.email,
            template: "welcome",
        });
        });
    }
);


