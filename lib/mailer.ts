/**
 * ==============================================================================
 * FILE: client/lib/mailer.ts
 * ==============================================================================
 * PURPOSE:
 *   Configures Nodemailer with Gmail SMTP (using GMAIL_USER and GMAIL_PASSWORD
 *   App Password from `client/.env.local`) and renders a clean, responsive,
 *   professional HTML verification email for Passwordless Admin OTP Login!
 *
 * HOW IT WORKS STEP-BY-STEP:
 *   1. Reads `process.env.GMAIL_USER` and `process.env.GMAIL_PASSWORD`.
 *   2. Creates a Nodemailer SMTP transporter connected to Gmail (`service: "gmail"`).
 *   3. Formats the 6-digit OTP code inside individual styled digit boxes so it
 *      looks ultra-clean in Gmail Web, Gmail Mobile, Outlook, and Apple Mail.
 *   4. Sends both `html` (rich design) and `text` (plain-text fallback).
 *
 * USED BY:
 *   - `client/app/api/auth/admin-otp/send/route.ts`
 * ==============================================================================
 */

import nodemailer from "nodemailer"

// Create a reusable Gmail SMTP transporter using App Password credentials
function createGmailTransporter() {
  const user = process.env.GMAIL_USER
  const pass = process.env.GMAIL_PASSWORD

  if (!user || !pass) {
    throw new Error("GMAIL_USER or GMAIL_PASSWORD is missing in client/.env.local")
  }

  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user,
      pass,
    },
  })
}

/**
 * Sends a beautifully designed, brand-matched 6-digit Admin Verification OTP email.
 */
export async function sendAdminOtpEmail({
  to,
  code,
  expiresInMinutes = 10,
}: {
  to: string
  code: string
  expiresInMinutes?: number
}) {
  const transporter = createGmailTransporter()
  const fromAddress = process.env.GMAIL_USER

  // Split the 6-digit code into individual character boxes for crisp visual presentation
  const digitBoxes = code
    .split("")
    .map(
      (digit) => `
        <td style="padding: 0 5px;">
          <div style="
            width: 46px;
            height: 56px;
            line-height: 56px;
            text-align: center;
            font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
            font-size: 28px;
            font-weight: 700;
            color: #FFFFFF;
            background-color: #161622;
            border: 1px solid #353068;
            border-radius: 12px;
            box-shadow: inset 0 1px 0 rgba(255,255,255,0.08);
          ">${digit}</div>
        </td>`
    )
    .join("")

  const timestamp = new Date().toLocaleString("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZoneName: "short",
  })

  // Responsive, Gmail-compatible HTML email matching HireLoop 2.0 dark luxury design
  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>HireLoop Admin Verification Code</title>
</head>
<body style="margin:0; padding:0; background-color:#07070A; font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color:#EDEDEF;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color:#07070A; padding:40px 16px;">
    <tr>
      <td align="center">
        <!-- Main Container -->
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width:560px; background-color:#111116; border:1px solid #23232E; border-radius:20px; overflow:hidden; box-shadow:0 24px 60px rgba(0,0,0,0.6);">

          <!-- Top Purple Gradient Accent Bar -->
          <tr>
            <td style="height:4px; background:linear-gradient(90deg, #38BDF8 0%, #5C53FE 50%, #F97316 100%); font-size:0; line-height:0;">&nbsp;</td>
          </tr>

          <!-- Header / Brand -->
          <tr>
            <td style="padding:32px 36px 20px 36px; border-bottom:1px solid #1E1E28;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td align="left">
                    <span style="font-size:22px; font-weight:800; letter-spacing:-0.03em; color:#FFFFFF;">
                      hire<span style="color:#5C53FE;">loop</span>
                    </span>
                  </td>
                  <td align="right">
                    <span style="display:inline-block; padding:5px 11px; border-radius:999px; background-color:#1D1A3B; border:1px solid #3D3688; color:#A59FFF; font-size:11px; font-weight:600; letter-spacing:0.08em; text-transform:uppercase;">
                      Admin Security
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Body Content -->
          <tr>
            <td style="padding:36px 36px 28px 36px;">
              <p style="margin:0 0 8px 0; font-size:12px; font-weight:600; letter-spacing:0.12em; text-transform:uppercase; color:#8F88FF;">
                One-Time Sign-In Code
              </p>
              <h1 style="margin:0 0 14px 0; font-size:24px; font-weight:700; line-height:1.3; letter-spacing:-0.02em; color:#FFFFFF;">
                Verify your Admin Console login
              </h1>
              <p style="margin:0 0 28px 0; font-size:14px; line-height:1.65; color:#A1A4AA;">
                Use the 6-digit security code below to sign in to the <strong style="color:#FFFFFF;">HireLoop Admin Console</strong>. No password is required — simply enter this code on the verification screen.
              </p>

              <!-- Highlighted OTP Box -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color:#0B0B10; border:1px solid #262636; border-radius:16px; padding:26px 16px;">
                <tr>
                  <td align="center">
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                      <tr>
                        ${digitBoxes}
                      </tr>
                    </table>
                    <p style="margin:18px 0 0 0; font-size:12px; color:#8B8E98;">
                      This verification code expires in <strong style="color:#EDEDEF;">${expiresInMinutes} minutes</strong> and can only be used once.
                    </p>
                  </td>
                </tr>
              </table>

              <!-- Security Metadata Card -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-top:24px; background-color:#15151C; border:1px solid #22222E; border-radius:12px;">
                <tr>
                  <td style="padding:14px 18px;">
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="font-size:12px; color:#A1A4AA;">
                      <tr>
                        <td style="padding:3px 0; color:#6E6E78;">Authorized Email</td>
                        <td align="right" style="padding:3px 0; color:#EDEDEF; font-family:monospace;">${to}</td>
                      </tr>
                      <tr>
                        <td style="padding:3px 0; color:#6E6E78;">Requested At</td>
                        <td align="right" style="padding:3px 0; color:#EDEDEF;">${timestamp}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Warning Note -->
              <p style="margin:24px 0 0 0; font-size:12px; line-height:1.6; color:#7C7F87;">
                If you did not request this code, you can safely ignore this email. Never share your verification code with anyone — HireLoop staff will never ask for it.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:20px 36px; background-color:#0C0C10; border-top:1px solid #1E1E28; text-align:center;">
              <p style="margin:0; font-size:11px; color:#6E6E78;">
                &copy; ${new Date().getFullYear()} HireLoop Career Platform &bull; Automated Security Mailer
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `

  const text = `HireLoop Admin Console — Verification Code\n\nYour 6-digit login code is: ${code}\n\nThis code expires in ${expiresInMinutes} minutes and can only be used once.\nIf you did not request this login, please ignore this email.`

  // Send the email via Gmail SMTP
  const info = await transporter.sendMail({
    from: `"HireLoop Security" <${fromAddress}>`,
    to,
    subject: `${code} is your HireLoop Admin verification code`,
    text,
    html,
  })

  return info
}

/**
 * Sends a professional Password Reset email (with 6-digit OTP code + direct link)
 * for Job Seekers and Recruiters.
 *
 * CALLED FROM:
 *   - `client/app/api/auth/forgot-password/send/route.ts`
 */
export async function sendPasswordResetEmail({
  to,
  userName,
  code,
  resetUrl,
  expiresInMinutes = 15,
}: {
  to: string
  userName: string
  code: string
  resetUrl: string
  expiresInMinutes?: number
}) {
  const transporter = createGmailTransporter()
  const fromAddress = process.env.GMAIL_USER

  const digitBoxes = code
    .split("")
    .map(
      (digit) => `
        <td style="padding: 0 5px;">
          <div style="
            width: 46px;
            height: 56px;
            line-height: 56px;
            text-align: center;
            font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
            font-size: 28px;
            font-weight: 700;
            color: #FFFFFF;
            background-color: #161622;
            border: 1px solid #353068;
            border-radius: 12px;
          ">${digit}</div>
        </td>`
    )
    .join("")

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Reset Your HireLoop Password</title>
</head>
<body style="margin:0; padding:0; background-color:#07070A; font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color:#EDEDEF;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color:#07070A; padding:40px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width:560px; background-color:#111116; border:1px solid #23232E; border-radius:20px; overflow:hidden; box-shadow:0 24px 60px rgba(0,0,0,0.6);">
          <tr>
            <td style="height:4px; background:linear-gradient(90deg, #38BDF8 0%, #5C53FE 50%, #F97316 100%); font-size:0; line-height:0;">&nbsp;</td>
          </tr>

          <tr>
            <td style="padding:32px 36px 20px 36px; border-bottom:1px solid #1E1E28;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td align="left">
                    <span style="font-size:22px; font-weight:800; letter-spacing:-0.03em; color:#FFFFFF;">
                      hire<span style="color:#5C53FE;">loop</span>
                    </span>
                  </td>
                  <td align="right">
                    <span style="display:inline-block; padding:5px 11px; border-radius:999px; background-color:#1D1A3B; border:1px solid #3D3688; color:#A59FFF; font-size:11px; font-weight:600; letter-spacing:0.08em; text-transform:uppercase;">
                      Password Reset
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <tr>
            <td style="padding:36px 36px 28px 36px;">
              <p style="margin:0 0 8px 0; font-size:12px; font-weight:600; letter-spacing:0.12em; text-transform:uppercase; color:#8F88FF;">
                Account Recovery
              </p>
              <h1 style="margin:0 0 14px 0; font-size:24px; font-weight:700; line-height:1.3; letter-spacing:-0.02em; color:#FFFFFF;">
                Hi ${userName}, reset your password
              </h1>
              <p style="margin:0 0 26px 0; font-size:14px; line-height:1.65; color:#A1A4AA;">
                We received a request to reset the password for your <strong style="color:#FFFFFF;">HireLoop</strong> account (<span style="color:#EDEDEF;">${to}</span>). Enter the 6-digit code below or click the button to set a new password.
              </p>

              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color:#0B0B10; border:1px solid #262636; border-radius:16px; padding:26px 16px;">
                <tr>
                  <td align="center">
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                      <tr>${digitBoxes}</tr>
                    </table>
                    <p style="margin:18px 0 0 0; font-size:12px; color:#8B8E98;">
                      Code expires in <strong style="color:#EDEDEF;">${expiresInMinutes} minutes</strong>.
                    </p>
                  </td>
                </tr>
              </table>

              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-top:24px;">
                <tr>
                  <td align="center">
                    <a href="${resetUrl}" style="display:inline-block; padding:13px 28px; border-radius:10px; background-color:#5C53FE; color:#FFFFFF; font-size:14px; font-weight:600; text-decoration:none;">
                      Reset My Password
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin:26px 0 0 0; font-size:12px; line-height:1.6; color:#7C7F87;">
                If you didn&apos;t request a password reset, you can safely ignore this email — your password will remain unchanged.
              </p>
            </td>
          </tr>

          <tr>
            <td style="padding:20px 36px; background-color:#0C0C10; border-top:1px solid #1E1E28; text-align:center;">
              <p style="margin:0; font-size:11px; color:#6E6E78;">
                &copy; ${new Date().getFullYear()} HireLoop Career Platform &bull; Account Security
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `

  const text = `Hi ${userName},\n\nYour HireLoop password reset code is: ${code}\n\nOr open this link directly: ${resetUrl}\n\nThis code expires in ${expiresInMinutes} minutes.`

  return transporter.sendMail({
    from: `"HireLoop Security" <${fromAddress}>`,
    to,
    subject: `${code} is your HireLoop password reset code`,
    text,
    html,
  })
}
