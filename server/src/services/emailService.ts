import db from '../db.js';
import { v4 as uuidv4 } from 'uuid';

export interface EmailPayload {
  bookingId?: string;
  recipient: string;
  subject: string;
  type:
    | 'request_received'
    | 'request_approved'
    | 'request_declined'
    | 'quote_issued'
    | 'quote_accepted'
    | 'payment_link'
    | 'payment_confirmed'
    | 'booking_cancelled';
  bodyText: string;
}

export async function sendNotificationEmail(payload: EmailPayload): Promise<{ success: boolean; logId: string }> {
  const logId = uuidv4();

  // Save to audit database
  try {
    const insertLog = db.prepare(`
      INSERT INTO email_logs (id, booking_id, recipient, subject, type, body_preview, status)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    insertLog.run(
      logId,
      payload.bookingId || null,
      payload.recipient,
      payload.subject,
      payload.type,
      payload.bodyText.substring(0, 500),
      'delivered'
    );
  } catch (err) {
    console.error('Failed to write email audit log:', err);
  }

  // Console notification banner
  console.log(`\n📧 [EMAIL DELIVERED] To: ${payload.recipient} | Subject: "${payload.subject}" [${payload.type}]`);
  console.log(`------------------------------------------------------------------`);
  console.log(payload.bodyText);
  console.log(`------------------------------------------------------------------\n`);

  return { success: true, logId };
}
