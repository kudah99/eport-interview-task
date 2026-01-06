import nodemailer from "nodemailer";

interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail({ to, subject, html }: SendEmailOptions) {
  // Check if email is configured
  const smtpHost = process.env.SMTP_HOST;
  const smtpUser = process.env.SMTP_USER;
  const smtpPassword = process.env.SMTP_PASSWORD;
  const smtpFrom = process.env.SMTP_FROM || smtpUser;

  if (!smtpHost || !smtpUser || !smtpPassword) {
    console.warn("⚠️  Email not configured. SMTP settings missing. Email will not be sent.");
    return { success: false, error: "Email not configured" };
  }

  try {
    // Create transporter for Gmail SMTP
    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: parseInt(process.env.SMTP_PORT || "587"),
      secure: process.env.SMTP_SECURE === "true", // true for 465, false for other ports
      auth: {
        user: smtpUser,
        pass: smtpPassword,
      },
    });

    // Send email
    const info = await transporter.sendMail({
      from: `"Asset Manager" <${smtpFrom}>`,
      to,
      subject,
      html,
    });

    console.log("✅ Email sent successfully:", info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("❌ Error sending email:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    
    // Provide helpful error messages for common Gmail issues
    let helpfulError = errorMessage;
    if (errorMessage.includes("Invalid login") || errorMessage.includes("BadCredentials") || errorMessage.includes("535")) {
      helpfulError = `Gmail authentication failed. Please ensure:
1. You're using an App Password (not your regular Gmail password)
2. 2-Step Verification is enabled on your Google Account
3. The App Password was generated for "Mail" application
4. There are no extra spaces in SMTP_PASSWORD

To generate an App Password:
- Go to: https://myaccount.google.com/apppasswords
- Or: Google Account > Security > 2-Step Verification > App passwords
- Select "Mail" and your device
- Copy the 16-character password (no spaces)`;
    }
    
    return {
      success: false,
      error: helpfulError,
    };
  }
}

export function createUserCredentialsEmail(email: string, password: string, loginUrl: string) {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body {
          font-family: Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
        }
        .header {
          background-color: #20b2aa;
          color: white;
          padding: 20px;
          text-align: center;
          border-radius: 5px 5px 0 0;
        }
        .content {
          background-color: #f9f9f9;
          padding: 30px;
          border-radius: 0 0 5px 5px;
        }
        .credentials {
          background-color: white;
          padding: 20px;
          border-radius: 5px;
          margin: 20px 0;
          border-left: 4px solid #20b2aa;
        }
        .credential-item {
          margin: 10px 0;
        }
        .label {
          font-weight: bold;
          color: #666;
        }
        .value {
          font-family: monospace;
          background-color: #f5f5f5;
          padding: 5px 10px;
          border-radius: 3px;
          display: inline-block;
          margin-left: 10px;
        }
        .button {
          display: inline-block;
          padding: 12px 24px;
          background-color: #20b2aa;
          color: white;
          text-decoration: none;
          border-radius: 5px;
          margin: 20px 0;
        }
        .footer {
          text-align: center;
          color: #666;
          font-size: 12px;
          margin-top: 30px;
        }
        .warning {
          background-color: #fff3cd;
          border: 1px solid #ffc107;
          padding: 15px;
          border-radius: 5px;
          margin: 20px 0;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>Welcome to Asset Manager</h1>
      </div>
      <div class="content">
        <p>Hello,</p>
        <p>Your account has been created successfully. Below are your login credentials:</p>
        
        <div class="credentials">
          <div class="credential-item">
            <span class="label">Email:</span>
            <span class="value">${email}</span>
          </div>
          <div class="credential-item">
            <span class="label">Password:</span>
            <span class="value">${password}</span>
          </div>
        </div>

        <div class="warning">
          <strong>⚠️ Security Notice:</strong> Please change your password after your first login for security purposes.
        </div>

        <p>You can now login to the Asset Manager system:</p>
        <a href="${loginUrl}" class="button">Login to Asset Manager</a>

        <p>If you have any questions or need assistance, please contact your administrator.</p>
      </div>
      <div class="footer">
        <p>This is an automated message from Asset Manager. Please do not reply to this email.</p>
      </div>
    </body>
    </html>
  `;

  return html;
}

export function createAssetCreatedEmail(assetName: string, category: string, department: string, cost: number | null, datePurchased: string | null, dashboardUrl: string) {
  const formattedCost = cost !== null ? `$${cost.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : 'N/A';
  const formattedDate = datePurchased ? new Date(datePurchased).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'N/A';
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body {
          font-family: Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
        }
        .header {
          background-color: #20b2aa;
          color: white;
          padding: 20px;
          text-align: center;
          border-radius: 5px 5px 0 0;
        }
        .content {
          background-color: #f9f9f9;
          padding: 30px;
          border-radius: 0 0 5px 5px;
        }
        .success-badge {
          background-color: #d4edda;
          border: 1px solid #c3e6cb;
          color: #155724;
          padding: 15px;
          border-radius: 5px;
          margin: 20px 0;
          text-align: center;
          font-weight: bold;
        }
        .asset-details {
          background-color: white;
          padding: 20px;
          border-radius: 5px;
          margin: 20px 0;
          border-left: 4px solid #20b2aa;
        }
        .detail-item {
          margin: 10px 0;
          padding: 8px 0;
          border-bottom: 1px solid #eee;
        }
        .detail-item:last-child {
          border-bottom: none;
        }
        .label {
          font-weight: bold;
          color: #666;
          display: inline-block;
          width: 140px;
        }
        .value {
          color: #333;
        }
        .button {
          display: inline-block;
          padding: 12px 24px;
          background-color: #20b2aa;
          color: white;
          text-decoration: none;
          border-radius: 5px;
          margin: 20px 0;
        }
        .footer {
          text-align: center;
          color: #666;
          font-size: 12px;
          margin-top: 30px;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>Asset Created Successfully</h1>
      </div>
      <div class="content">
        <p>Hello,</p>
        <p>Your asset has been created successfully in the Asset Manager system.</p>
        
        <div class="success-badge">
          ✓ Asset Created Successfully
        </div>
        
        <div class="asset-details">
          <h3 style="margin-top: 0; color: #20b2aa;">Asset Details</h3>
          <div class="detail-item">
            <span class="label">Asset Name:</span>
            <span class="value">${assetName}</span>
          </div>
          <div class="detail-item">
            <span class="label">Category:</span>
            <span class="value">${category}</span>
          </div>
          <div class="detail-item">
            <span class="label">Department:</span>
            <span class="value">${department}</span>
          </div>
          <div class="detail-item">
            <span class="label">Cost:</span>
            <span class="value">${formattedCost}</span>
          </div>
          <div class="detail-item">
            <span class="label">Date Purchased:</span>
            <span class="value">${formattedDate}</span>
          </div>
        </div>

        <p>You can view and manage your assets in the dashboard:</p>
        <div style="text-align: center;">
          <a href="${dashboardUrl}" class="button">View My Assets</a>
        </div>

        <p>If you have any questions or need assistance, please contact your administrator.</p>
      </div>
      <div class="footer">
        <p>This is an automated message from Asset Manager. Please do not reply to this email.</p>
      </div>
    </body>
    </html>
  `;

  return html;
}

export function createProfileUpdateRequestEmail(
  userEmail: string,
  currentName: string,
  requestedEmail: string,
  requestedName: string,
  adminDashboardUrl: string
) {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body {
          font-family: Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
        }
        .header {
          background-color: #20b2aa;
          color: white;
          padding: 20px;
          text-align: center;
          border-radius: 5px 5px 0 0;
        }
        .content {
          background-color: #f9f9f9;
          padding: 30px;
          border-radius: 0 0 5px 5px;
        }
        .request-badge {
          background-color: #fff3cd;
          border: 1px solid #ffc107;
          color: #856404;
          padding: 15px;
          border-radius: 5px;
          margin: 20px 0;
          text-align: center;
          font-weight: bold;
        }
        .request-details {
          background-color: white;
          padding: 20px;
          border-radius: 5px;
          margin: 20px 0;
          border-left: 4px solid #20b2aa;
        }
        .detail-item {
          margin: 10px 0;
          padding: 8px 0;
          border-bottom: 1px solid #eee;
        }
        .detail-item:last-child {
          border-bottom: none;
        }
        .label {
          font-weight: bold;
          color: #666;
          display: inline-block;
          width: 160px;
        }
        .value {
          color: #333;
        }
        .button {
          display: inline-block;
          padding: 12px 24px;
          background-color: #20b2aa;
          color: white;
          text-decoration: none;
          border-radius: 5px;
          margin: 20px 0;
        }
        .footer {
          text-align: center;
          color: #666;
          font-size: 12px;
          margin-top: 30px;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>New Profile Update Request</h1>
      </div>
      <div class="content">
        <p>Hello Admin,</p>
        <p>A user has requested a profile update that requires your approval.</p>
        
        <div class="request-badge">
          ⚠️ Pending Approval Required
        </div>
        
        <div class="request-details">
          <h3 style="margin-top: 0; color: #20b2aa;">Request Details</h3>
          <div class="detail-item">
            <span class="label">User Email:</span>
            <span class="value">${userEmail}</span>
          </div>
          <div class="detail-item">
            <span class="label">Current Name:</span>
            <span class="value">${currentName}</span>
          </div>
          <div class="detail-item">
            <span class="label">Requested Name:</span>
            <span class="value">${requestedName}</span>
          </div>
          <div class="detail-item">
            <span class="label">Current Email:</span>
            <span class="value">${userEmail}</span>
          </div>
          <div class="detail-item">
            <span class="label">Requested Email:</span>
            <span class="value">${requestedEmail}</span>
          </div>
        </div>

        <p>Please review and approve or reject this request:</p>
        <div style="text-align: center;">
          <a href="${adminDashboardUrl}" class="button">Review Request</a>
        </div>

        <p>If you have any questions, please contact the user directly.</p>
      </div>
      <div class="footer">
        <p>This is an automated message from Asset Manager. Please do not reply to this email.</p>
      </div>
    </body>
    </html>
  `;

  return html;
}

export function createProfileUpdateApprovedEmail(
  userEmail: string,
  userName: string,
  dashboardUrl: string
) {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body {
          font-family: Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
        }
        .header {
          background-color: #20b2aa;
          color: white;
          padding: 20px;
          text-align: center;
          border-radius: 5px 5px 0 0;
        }
        .content {
          background-color: #f9f9f9;
          padding: 30px;
          border-radius: 0 0 5px 5px;
        }
        .success-badge {
          background-color: #d4edda;
          border: 1px solid #c3e6cb;
          color: #155724;
          padding: 15px;
          border-radius: 5px;
          margin: 20px 0;
          text-align: center;
          font-weight: bold;
        }
        .button {
          display: inline-block;
          padding: 12px 24px;
          background-color: #20b2aa;
          color: white;
          text-decoration: none;
          border-radius: 5px;
          margin: 20px 0;
        }
        .footer {
          text-align: center;
          color: #666;
          font-size: 12px;
          margin-top: 30px;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>Profile Update Approved</h1>
      </div>
      <div class="content">
        <p>Hello ${userName},</p>
        <p>Your profile update request has been approved and your profile has been updated successfully.</p>
        
        <div class="success-badge">
          ✓ Profile Update Approved
        </div>

        <p>Your profile information has been updated in the system. You can now log in with your updated information.</p>

        <div style="text-align: center;">
          <a href="${dashboardUrl}" class="button">Go to Dashboard</a>
        </div>

        <p>If you have any questions or need assistance, please contact your administrator.</p>
      </div>
      <div class="footer">
        <p>This is an automated message from Asset Manager. Please do not reply to this email.</p>
      </div>
    </body>
    </html>
  `;

  return html;
}

export function createProfileUpdateRejectedEmail(
  userEmail: string,
  rejectionReason: string,
  dashboardUrl: string
) {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body {
          font-family: Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
        }
        .header {
          background-color: #dc3545;
          color: white;
          padding: 20px;
          text-align: center;
          border-radius: 5px 5px 0 0;
        }
        .content {
          background-color: #f9f9f9;
          padding: 30px;
          border-radius: 0 0 5px 5px;
        }
        .rejection-badge {
          background-color: #f8d7da;
          border: 1px solid #f5c6cb;
          color: #721c24;
          padding: 15px;
          border-radius: 5px;
          margin: 20px 0;
          text-align: center;
          font-weight: bold;
        }
        .reason-box {
          background-color: white;
          padding: 20px;
          border-radius: 5px;
          margin: 20px 0;
          border-left: 4px solid #dc3545;
        }
        .button {
          display: inline-block;
          padding: 12px 24px;
          background-color: #20b2aa;
          color: white;
          text-decoration: none;
          border-radius: 5px;
          margin: 20px 0;
        }
        .footer {
          text-align: center;
          color: #666;
          font-size: 12px;
          margin-top: 30px;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>Profile Update Request Rejected</h1>
      </div>
      <div class="content">
        <p>Hello,</p>
        <p>Your profile update request has been reviewed and unfortunately, it has been rejected.</p>
        
        <div class="rejection-badge">
          ✗ Profile Update Rejected
        </div>

        <div class="reason-box">
          <h3 style="margin-top: 0; color: #dc3545;">Rejection Reason:</h3>
          <p>${rejectionReason}</p>
        </div>

        <p>If you believe this is an error or would like to submit a new request, please contact your administrator or submit a new profile update request.</p>

        <div style="text-align: center;">
          <a href="${dashboardUrl}" class="button">Go to Dashboard</a>
        </div>

        <p>If you have any questions or need assistance, please contact your administrator.</p>
      </div>
      <div class="footer">
        <p>This is an automated message from Asset Manager. Please do not reply to this email.</p>
      </div>
    </body>
    </html>
  `;

  return html;
}

