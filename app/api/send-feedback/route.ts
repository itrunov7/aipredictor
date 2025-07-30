import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    // Bot protection checks
    if (body.honeypot) {
      return NextResponse.json({ error: 'Invalid submission' }, { status: 400 });
    }
    
    // Validate required fields
    if (!body.name || !body.email || !body.message) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    
    // Format email content
    const emailContent = `
NEW FEEDBACK SUBMISSION
=======================

From: ${body.name} <${body.email}>
Type: ${body.feedbackType}
Trading Experience: ${body.experience || 'Not specified'}
Current Stocks Watching: ${body.currentTrade || 'Not specified'}

MESSAGE:
${body.message}

=======================
Submitted: ${body.timestamp}
User Agent: ${body.userAgent}
IP: ${req.ip || 'Unknown'}
    `.trim();
    
    // Here you can integrate with your preferred email service
    // For now, I'll show you how to structure it for different services
    
    console.log('📧 New feedback received:');
    console.log(emailContent);
    
    // Example using fetch to send email (you can replace this with your email service)
    // Option 1: Using a simple email service like EmailJS, SendGrid, or Resend
    
    try {
      // Simple email sending - you'll need to configure this based on your email service
      // For now, I'll create a basic structure that logs the email
      
      // You can integrate with services like:
      // - Resend: https://resend.com/
      // - SendGrid: https://sendgrid.com/
      // - Nodemailer with SMTP
      // - EmailJS for client-side sending
      
      const emailData = {
        to: 'i.trunov@atlantix.cc',
        from: 'noreply@sp500insights.com', // You'll need to verify this domain
        subject: `SP500 Insights Feedback: ${body.feedbackType} from ${body.name}`,
        text: emailContent,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #1f2937;">New Feedback Submission</h2>
            
            <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin-top: 0; color: #374151;">Contact Details</h3>
              <p><strong>Name:</strong> ${body.name}</p>
              <p><strong>Email:</strong> ${body.email}</p>
              <p><strong>Type:</strong> ${body.feedbackType}</p>
              <p><strong>Trading Experience:</strong> ${body.experience || 'Not specified'}</p>
              <p><strong>Current Stocks Watching:</strong> ${body.currentTrade || 'Not specified'}</p>
            </div>
            
            <div style="background: #ffffff; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px;">
              <h3 style="margin-top: 0; color: #374151;">Message</h3>
              <p style="white-space: pre-wrap;">${body.message}</p>
            </div>
            
            <div style="margin-top: 20px; padding: 15px; background: #f9fafb; border-radius: 6px; font-size: 12px; color: #6b7280;">
              <p><strong>Submitted:</strong> ${body.timestamp}</p>
              <p><strong>User Agent:</strong> ${body.userAgent}</p>
              <p><strong>IP:</strong> ${req.ip || 'Unknown'}</p>
            </div>
          </div>
        `
      };
      
      // For now, we'll just log it. You can replace this with actual email sending
      console.log('Email would be sent to:', emailData.to);
      console.log('Subject:', emailData.subject);
      
      // UNCOMMENT AND CONFIGURE ONE OF THESE EMAIL SERVICES:
      
      // Option 1: Using Resend (recommended)
      /*
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(emailData),
      });
      */
      
      // Option 2: Using SendGrid
      /*
      const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.SENDGRID_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          personalizations: [{
            to: [{ email: emailData.to }],
            subject: emailData.subject
          }],
          from: { email: emailData.from },
          content: [
            { type: 'text/plain', value: emailData.text },
            { type: 'text/html', value: emailData.html }
          ]
        }),
      });
      */
      
      // For now, simulate successful email sending
      const emailSent = true;
      
      if (emailSent) {
        return NextResponse.json({ 
          success: true, 
          message: 'Feedback sent successfully!' 
        });
      } else {
        throw new Error('Email sending failed');
      }
      
    } catch (emailError) {
      console.error('Email sending error:', emailError);
      
      // Even if email fails, we still want to log the feedback
      console.log('IMPORTANT: Email failed but feedback was received:', emailContent);
      
      return NextResponse.json({ 
        error: 'Email service temporarily unavailable. Please try again later.' 
      }, { status: 500 });
    }
    
  } catch (error) {
    console.error('Error processing feedback:', error);
    return NextResponse.json({ 
      error: 'Failed to process feedback' 
    }, { status: 500 });
  }
} 