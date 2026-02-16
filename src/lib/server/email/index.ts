import { env } from "$env/dynamic/private"

export interface EmailOptions {
  to: string
  subject: string
  html: string
  text?: string
}

export interface EmailProvider {
  send(options: EmailOptions): Promise<boolean>
}

class ConsoleEmailProvider implements EmailProvider {
  async send(options: EmailOptions): Promise<boolean> {
    console.log("=== Email (console provider) ===")
    console.log(`To: ${options.to}`)
    console.log(`Subject: ${options.subject}`)
    console.log(`Body: ${options.text ?? options.html}`)
    console.log("================================")
    return true
  }
}

class SmtpEmailProvider implements EmailProvider {
  async send(options: EmailOptions): Promise<boolean> {
    const smtpUrl = env.SMTP_URL
    if (!smtpUrl) {
      console.warn("SMTP_URL not configured, falling back to console")
      return new ConsoleEmailProvider().send(options)
    }
    // Placeholder: integrate with nodemailer, resend, sendgrid, etc.
    console.warn("SMTP provider is a placeholder for future implementation, using console fallback")
    return new ConsoleEmailProvider().send(options)
  }
}

function createEmailProvider(): EmailProvider {
  const provider = env.EMAIL_PROVIDER ?? "console"
  switch (provider) {
    case "smtp":
      return new SmtpEmailProvider()
    default:
      return new ConsoleEmailProvider()
  }
}

const emailProvider = createEmailProvider()

export async function sendEmail(options: EmailOptions): Promise<boolean> {
  return emailProvider.send(options)
}

export function buildConfirmationEmail(params: {
  eventName: string
  confirmationUrl: string
  registrantEmail: string
}): EmailOptions {
  const { eventName, confirmationUrl, registrantEmail } = params
  return {
    to: registrantEmail,
    subject: `Confirm your registration for ${eventName}`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Registration Confirmation</h2>
        <p>Thank you for registering for <strong>${eventName}</strong>.</p>
        <p>Please confirm your registration by clicking the link below:</p>
        <p>
          <a href="${confirmationUrl}" 
             style="display: inline-block; padding: 12px 24px; background-color: #0f172a; color: #fff; text-decoration: none; border-radius: 6px;">
            Confirm Registration
          </a>
        </p>
        <p style="color: #666; font-size: 14px;">
          If you didn't register for this event, you can safely ignore this email.
        </p>
      </div>
    `,
    text: `Thank you for registering for ${eventName}. Please confirm your registration by visiting: ${confirmationUrl}`
  }
}

export function buildRegistrationConfirmedEmail(params: { eventName: string; registrantEmail: string }): EmailOptions {
  const { eventName, registrantEmail } = params
  return {
    to: registrantEmail,
    subject: `Registration confirmed for ${eventName}`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>You're Registered!</h2>
        <p>Your registration for <strong>${eventName}</strong> has been confirmed.</p>
        <p>We look forward to seeing you there!</p>
      </div>
    `,
    text: `Your registration for ${eventName} has been confirmed. We look forward to seeing you there!`
  }
}
