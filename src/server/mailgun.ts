import Mailgun from "mailgun.js";
import formData from "form-data";
import { env } from "~/env";

const mailgun = new Mailgun(formData);

export const mailgunClient = mailgun.client({
  username: "api",
  key: env.MAILGUN_SENDING_KEY,
});
