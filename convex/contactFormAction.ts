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
  return {
    subject: `New Contact Form Submission - ${name}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
          .content { background: #fff; padding: 20px; border: 1px solid #e9ecef; border-radius: 8px; }
          .field { margin-bottom: 15px; }
          .label { font-weight: bold; color: #495057; }
          .value { margin-top: 5px; padding: 10px; background: #f8f9fa; border-radius: 4px; }
          .message-box { background: #fff; border: 1px solid #dee2e6; padding: 15px; border-radius: 4px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2>New Contact Form Submission</h2>
            <p>You have received a new message through your website contact form.</p>
          </div>
          <div class="content">
            <div class="field">
              <div class="label">Name:</div>
              <div class="value">${name}</div>
            </div>
            <div class="field">
              <div class="label">Email:</div>
              <div class="value">${email}</div>
            </div>
            <div class="field">
              <div class="label">Message:</div>
              <div class="message-box">${message.replace(/\n/g, '<br>')}</div>
            </div>
            <div class="field">
              <div class="label">Submitted:</div>
              <div class="value">${new Date().toLocaleString()}</div>
            </div>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
      New Contact Form Submission
      
      Name: ${name}
      Email: ${email}
      Message: ${message}
      Submitted: ${new Date().toLocaleString()}
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
      
      // Check for required environment variables
      if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
        console.error('Missing Gmail configuration environment variables');
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
          to: process.env.CONTACT_EMAIL || process.env.GMAIL_USER,
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

