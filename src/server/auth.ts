import { betterAuth } from "better-auth";
import { admin, emailOTP, username } from "better-auth/plugins";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { env } from "~/env";
import { db } from "~/server/db";
import { mailgunClient } from "./mailgun";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    usePlural: true,
  }),
  user: {
    additionalFields: {
      bio: {
        type: "string",
        required: false,
      },
    },
  },
  emailAndPassword: { enabled: true },
  socialProviders: {
    google: {
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
    },
  },
  plugins: [
    admin(),
    username(),
    emailOTP({
      async sendVerificationOTP({ email, otp, type }) {
        try {
          await mailgunClient.messages.create(env.MAILGUN_SENDING_DOMAIN, {
            from: `Editorverse <verification@${env.MAILGUN_SENDING_DOMAIN}>`,
            to: [email],
            subject: `Your ${type} verification code`,
            text: `Your verification code is ${otp}. It will expire in 5 minutes.`,
          });
        } catch (error) {
          console.error("Error sending verification email:", error);
          throw new Error("Failed to send verification email");
        }
      },
    }),
  ],
});
