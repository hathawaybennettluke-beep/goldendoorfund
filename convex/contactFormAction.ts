"use node";
import { action } from "./_generated/server";
import { v } from "convex/values";
import nodemailer from "nodemailer";
import { internal } from "./_generated/api";
import { Id } from "./_generated/dataModel";

// Create Gmail SMTP transporter
const createTransporter = () => {
  return nodemailer.createTransport({
    service: 'gmail',
    host: 'smtp.gmail.com',
    port: 587,
    secure: false, // Use TLS
    auth: {
      user: process.env.GMAIL_USER, // Your Gmail address
      pass: process.env.GMAIL_APP_PASSWORD, // Gmail App Password
    },
  });
};

// Email template function
const createEmailTemplate = (name: string, email: string, message: string) => {
  // Parse message to extract subject and category
  const messageLines = message.split('\n');
  const subjectLine = messageLines.find(line => line.startsWith('Subject:'));
  const categoryLine = messageLines.find(line => line.startsWith('Category:'));
  const actualMessage = messageLines.filter(line => !line.startsWith('Subject:') && !line.startsWith('Category:') && !line.startsWith('Message:')).join('\n').trim();
  
  const subject = subjectLine ? subjectLine.replace('Subject:', '').trim() : 'No subject';
  const category = categoryLine ? categoryLine.replace('Category:', '').trim() : 'General';
  
  return {
    subject: `New Contact Form Submission - ${name}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>New Contact Form Submission</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; 
            line-height: 1.6; 
            color: #1a1a1a; 
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            padding: 20px;
          }
          .container { 
            max-width: 600px; 
            margin: 0 auto; 
            background: #ffffff; 
            border-radius: 16px; 
            box-shadow: 0 20px 40px rgba(0,0,0,0.1);
            overflow: hidden;
          }
          .header { 
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            padding: 40px 30px;
            text-align: center;
            color: white;
          }
          .header h1 { 
            font-size: 28px; 
            font-weight: 700; 
            margin-bottom: 8px;
            letter-spacing: -0.5px;
          }
          .header p { 
            font-size: 16px; 
            opacity: 0.9;
            font-weight: 400;
          }
          .content { 
            padding: 40px 30px; 
          }
          .field { 
            margin-bottom: 24px; 
          }
          .field:last-child { 
            margin-bottom: 0; 
          }
          .label { 
            font-weight: 600; 
            color: #374151; 
            font-size: 14px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-bottom: 8px;
          }
          .value { 
            padding: 16px; 
            background: #f8fafc; 
            border-radius: 8px; 
            border-left: 4px solid #667eea;
            font-size: 16px;
            color: #1f2937;
          }
          .email-value { 
            padding: 16px; 
            background: #f8fafc; 
            border-radius: 8px; 
            border-left: 4px solid #667eea;
            font-size: 16px;
          }
          .email-value a { 
            color: #667eea; 
            text-decoration: none; 
            font-weight: 500;
          }
          .email-value a:hover { 
            text-decoration: underline; 
          }
          .message-box { 
            background: #f8fafc; 
            border: 1px solid #e5e7eb; 
            padding: 20px; 
            border-radius: 8px; 
            border-left: 4px solid #667eea;
            font-size: 16px;
            line-height: 1.7;
            color: #374151;
            white-space: pre-wrap;
          }
          .category-badge {
            display: inline-block;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 6px 12px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
          .footer { 
            background: #f8fafc; 
            padding: 30px; 
            text-align: center; 
            border-top: 1px solid #e5e7eb;
          }
          .footer p { 
            color: #6b7280; 
            font-size: 14px;
          }
          .logo { 
            font-size: 24px; 
            font-weight: 700; 
            color: white;
            margin-bottom: 16px;
          }
          @media (max-width: 600px) {
            body { padding: 10px; }
            .header { padding: 30px 20px; }
            .content { padding: 30px 20px; }
            .footer { padding: 20px; }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">Golden Door Fund</div>
            <h1>New Contact Form Submission</h1>
            <p>You have received a new message through your website contact form</p>
          </div>
          <div class="content">
            <div class="field">
              <div class="label">Name</div>
              <div class="value">${name}</div>
            </div>
            <div class="field">
              <div class="label">Email</div>
              <div class="email-value">
                <a href="mailto:${email}">${email}</a>
              </div>
            </div>
            <div class="field">
              <div class="label">Category</div>
              <div class="value">
                <span class="category-badge">${category}</span>
              </div>
            </div>
            <div class="field">
              <div class="label">Subject</div>
              <div class="value">${subject}</div>
            </div>
            <div class="field">
              <div class="label">Message</div>
              <div class="message-box">${actualMessage.replace(/\n/g, '<br>')}</div>
            </div>
            <div class="field">
              <div class="label">Submitted</div>
              <div class="value">${new Date().toLocaleString('en-US', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric', 
                hour: '2-digit', 
                minute: '2-digit',
                timeZoneName: 'short'
              })}</div>
            </div>
          </div>
          <div class="footer">
            <p>This email was sent from your Golden Door Fund contact form</p>
            <p>Reply directly to this email to respond to ${name}</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
      Golden Door Fund - New Contact Form Submission
      ================================================
      
      You have received a new message through your website contact form.
      
      Name: ${name}
      Email: ${email}
      Category: ${category}
      Subject: ${subject}
      
      Message:
      ${actualMessage}
      
      Submitted: ${new Date().toLocaleString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric', 
        hour: '2-digit', 
        minute: '2-digit',
        timeZoneName: 'short'
      })}
      
      ---
      Reply directly to this email to respond to ${name}
      This email was sent from your Golden Door Fund contact form
    `
  };
};

// Input validation function
const validateInput = (name: string, email: string, message: string) => {
  const errors: string[] = [];
  
  // Name validation
  if (!name || name.trim().length < 2) {
    errors.push("Name must be at least 2 characters long");
  }
  if (name.length > 100) {
    errors.push("Name must be less than 100 characters");
  }
  
  // Email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailRegex.test(email)) {
    errors.push("Please provide a valid email address");
  }
  if (email.length > 254) {
    errors.push("Email address is too long");
  }
  
  // Message validation
  if (!message || message.trim().length < 10) {
    errors.push("Message must be at least 10 characters long");
  }
  if (message.length > 5000) {
    errors.push("Message must be less than 5000 characters");
  }
  
  return errors;
};

// Sanitize input to prevent XSS
const sanitizeInput = (input: string): string => {
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;')
    .trim();
};



// Main action for submitting contact form
export const submitContactForm = action({
  args: {
    name: v.string(),
    email: v.string(),
    message: v.string(),
    ipAddress: v.optional(v.string()),
    userAgent: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    try {
      // Sanitize inputs
      const sanitizedName = sanitizeInput(args.name);
      const sanitizedEmail = sanitizeInput(args.email);
      const sanitizedMessage = sanitizeInput(args.message);
      
      // Validate inputs
      const validationErrors = validateInput(sanitizedName, sanitizedEmail, sanitizedMessage);
      if (validationErrors.length > 0) {
        throw new Error(`Validation failed: ${validationErrors.join(', ')}`);
      }
      
      // Check for required environment variables (temporarily disabled)
      if (!process.env.GMAIL_USER) {
        console.error('Missing Gmail user environment variable');
        throw new Error('Email service is not properly configured');
      }
      
      // Check for required environment variables
      if (!process.env.GMAIL_APP_PASSWORD) {
        console.error('Missing Gmail app password environment variable');
        throw new Error('Email service is not properly configured');
      }
      
      let emailSent = false;
      let emailError = null;
      
      // Store submission in database first using internal mutation
      const submissionId:Id<"contactSubmissions"> = await ctx.runMutation(internal.contactForm.storeContactSubmission, {
        name: sanitizedName,
        email: sanitizedEmail,
        message: sanitizedMessage,
        ipAddress: args.ipAddress,
        userAgent: args.userAgent,
      });
      
      // Attempt to send email notification
      try {
        const transporter = createTransporter();
        const emailTemplate = createEmailTemplate(sanitizedName, sanitizedEmail, sanitizedMessage);
        
        const mailOptions = {
          from: `"Golden Door Fund Contact" <${process.env.GMAIL_USER}>`,
          to: process.env.CONTACT_EMAIL || "goldendoor@goldendoorfund.org",
          replyTo: sanitizedEmail,
          subject: emailTemplate.subject,
          html: emailTemplate.html,
          text: emailTemplate.text,
        };
        
        await transporter.sendMail(mailOptions);
        emailSent = true;
        
        console.log(`Contact form email sent successfully for submission ${submissionId}`);
        
      } catch (emailErr) {
        emailError = emailErr;
        console.error('Failed to send contact form email:', emailErr);
        // Don't throw here - we still want to save the submission
      }
      
      // Update submission with email status using internal mutation
      await ctx.runMutation(internal.contactForm.updateSubmissionEmailStatus, {
        submissionId,
        emailSent,
      });
      
      // If email failed, log it but don't fail the entire operation
      if (!emailSent && emailError) {
        console.error(`Email sending failed for submission ${submissionId}:`, emailError);
      }
      
      return {
        success: true,
        submissionId,
        emailSent,
        message: emailSent 
          ? "Thank you for your message! We'll get back to you soon."
          : "Your message has been received. We'll get back to you soon."
      };
      
    } catch (error) {
      console.error('Contact form submission error:', error);
      
      // Return user-friendly error messages
      if (error instanceof Error) {
        if (error.message.includes('Validation failed')) {
          throw new Error(error.message);
        }
        if (error.message.includes('not properly configured')) {
          throw new Error('Contact form is temporarily unavailable. Please try again later.');
        }
      }
      
      throw new Error('Failed to submit contact form. Please try again later.');
    }
  },
});

