# Contact Form with Gmail SMTP Setup Guide

This guide will help you set up the contact form system with Gmail SMTP integration using Convex backend.

## Overview

The contact form system includes:
- **Frontend**: React contact form with validation and loading states
- **Backend**: Convex mutation for storing submissions and sending emails
- **Email**: Gmail SMTP integration with HTML templates
- **Database**: Convex schema for contact submissions

## Prerequisites

1. **Google Workspace Account**: You need access to `goldendoor@goldendoorfund.org`
2. **Gmail App Password**: Required for SMTP authentication
3. **Convex Project**: Your Convex backend should be set up
4. **Next.js Project**: Your frontend application

## Step 1: Gmail App Password Setup

### Enable 2-Factor Authentication
1. Go to [Google Account Security](https://myaccount.google.com/security)
2. Enable 2-Step Verification if not already enabled
3. Wait for 2FA to be fully activated (may take a few minutes)

### Generate App Password
1. Go to [Google Account Security](https://myaccount.google.com/security)
2. Click on "2-Step Verification"
3. Scroll down and click "App passwords"
4. Select "Mail" as the app and "Other" as the device
5. Enter "Donation Platform Contact Form" as the device name
6. Click "Generate"
7. **Copy the 16-character password** (you won't see it again)

### Alternative Method (if App Passwords option is not visible)
1. Go to [Google Account](https://myaccount.google.com/)
2. Search for "App passwords" in the search bar
3. Follow the same steps as above

## Step 2: Environment Variables Setup

### Convex Environment Variables

Add these variables to your Convex dashboard:

1. Go to [Convex Dashboard](https://dashboard.convex.dev/)
2. Select your project
3. Go to "Settings" → "Environment Variables"
4. Add the following variables:

```bash
# Gmail SMTP Configuration
GMAIL_USER=goldendoor@goldendoorfund.org
GMAIL_APP_PASSWORD=your_16_character_app_password_here

# Contact Email (where notifications are sent)
CONTACT_EMAIL=goldendoor@goldendoorfund.org
```

### Next.js Environment Variables (Optional)

If you need any frontend environment variables, add them to `.env.local`:

```bash
# Add any frontend-specific variables here if needed
# Currently, all email configuration is handled in Convex
```

## Step 3: Install Dependencies

Make sure you have the required dependencies installed:

```bash
# Install nodemailer for email functionality
npm install nodemailer @types/nodemailer

# Install sonner for toast notifications (if not already installed)
npm install sonner
```

## Step 4: Verify File Structure

Ensure you have the following files in place:

```
project-root/
├── convex/
│   ├── schema.ts              # Updated with contactSubmissions table
│   └── contactForm.ts         # New mutation functions
├── src/
│   └── app/
│       └── contact/
│           └── page.tsx       # Updated contact form component
└── CONTACT_FORM_SETUP.md     # This setup guide
```

## Step 5: Test the Setup

### 1. Start Development Server
```bash
npm run dev
```

### 2. Test Contact Form
1. Navigate to `/contact` page
2. Fill out the contact form with test data:
   - **Name**: Test User
   - **Email**: your-test-email@example.com
   - **Subject**: Test Submission
   - **Message**: This is a test message to verify the contact form is working.
3. Click "Send Message"
4. Verify:
   - Form shows loading state
   - Success message appears
   - Email is received at `goldendoor@goldendoorfund.org`
   - Submission is stored in Convex database

### 3. Check Convex Dashboard
1. Go to Convex Dashboard → Data
2. Check the `contactSubmissions` table
3. Verify the test submission is stored with correct data

## Step 6: Email Template Customization

The email template is defined in `convex/contactForm.ts`. You can customize:

- **Subject Line**: Currently "New Contact Form Submission - [Name]"
- **HTML Template**: Styled email with sender details
- **Text Version**: Plain text fallback
- **Reply-To**: Set to sender's email for easy replies

## Security Features

### Input Validation
- Name: 2-100 characters
- Email: Valid email format, max 254 characters
- Message: 10-5000 characters
- XSS protection with input sanitization

### Rate Limiting & Security
- IP address logging for spam prevention
- User agent tracking for debugging
- Input sanitization to prevent XSS attacks
- Graceful error handling

### Data Privacy
- Sensitive data stored securely in Convex
- Environment variables for credentials
- No credentials in client-side code

## Troubleshooting

### Common Issues

#### 1. "Email service is not properly configured"
**Solution**: Check that `GMAIL_USER` and `GMAIL_APP_PASSWORD` are set in Convex environment variables.

#### 2. "Authentication failed" or SMTP errors
**Solutions**:
- Verify the App Password is correct (16 characters, no spaces)
- Ensure 2FA is enabled on the Google account
- Try generating a new App Password
- Check that the email address is correct

#### 3. Emails not being received
**Solutions**:
- Check spam/junk folder
- Verify `CONTACT_EMAIL` environment variable
- Test with a different email address
- Check Convex logs for errors

#### 4. Form submission fails
**Solutions**:
- Check browser console for errors
- Verify Convex connection
- Check network connectivity
- Ensure all required fields are filled

### Debug Steps

1. **Check Convex Logs**:
   - Go to Convex Dashboard → Logs
   - Look for contact form related errors

2. **Test SMTP Connection**:
   - Check if Gmail credentials are working
   - Verify network allows SMTP connections

3. **Validate Environment Variables**:
   - Ensure all required variables are set
   - Check for typos in variable names

## Admin Dashboard (Optional)

The system includes queries for building an admin dashboard:

- `getAllContactSubmissions`: Get all submissions with filtering
- `getContactSubmissionById`: Get specific submission
- `updateContactSubmissionStatus`: Mark as processed/replied
- `getContactFormStats`: Get submission statistics

To implement an admin dashboard:

1. Create an admin page (e.g., `/admin/contact-submissions`)
2. Use the provided Convex queries
3. Add role-based access control
4. Display submissions in a table format

## Production Deployment

### Before Going Live

1. **Update Email Addresses**: Ensure all email addresses are production-ready
2. **Test Thoroughly**: Test the complete flow in production environment
3. **Monitor Logs**: Set up monitoring for email delivery issues
4. **Backup Strategy**: Ensure Convex data is backed up

### Environment Variables Checklist

- [ ] `GMAIL_USER` set to production email
- [ ] `GMAIL_APP_PASSWORD` generated for production account
- [ ] `CONTACT_EMAIL` set to correct recipient
- [ ] All variables added to Convex production environment

## Support

If you encounter issues:

1. Check this documentation first
2. Review Convex logs for errors
3. Test with a simple email client to verify SMTP settings
4. Contact your system administrator for Google Workspace issues

## File References

- **Schema**: `convex/schema.ts` - Database table definitions
- **Backend**: `convex/contactForm.ts` - Email and database logic
- **Frontend**: `src/app/contact/page.tsx` - Contact form UI
- **Setup**: `CONTACT_FORM_SETUP.md` - This documentation

---

**Last Updated**: January 2025
**Version**: 1.0.0