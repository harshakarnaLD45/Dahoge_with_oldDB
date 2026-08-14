import emailjs from '@emailjs/browser';
import { emailJSConfig } from './emailjs';

// Send email using EmailJS
export const sendEmail = async (templateParams) => {
  try {
    // Validate configuration
    if (!emailJSConfig.serviceId || !emailJSConfig.templateId || !emailJSConfig.publicKey) {
      throw new Error('EmailJS configuration is incomplete. Please check your environment variables.');
    }

    const response = await emailjs.send(
      emailJSConfig.serviceId,
      emailJSConfig.templateId,
      templateParams,
      emailJSConfig.publicKey
    );

    return { success: true, response };
  } catch (error) {
    console.error('EmailJS Error:', error);
    return { success: false, error: error.message || 'Failed to send email' };
  }
};

// Send contact form email
export const sendContactEmail = async (formData) => {
  const templateParams = {
    from_name: formData.name,
    from_email: formData.email,
    subject: formData.subject,
    message: formData.message,
    to_name: 'Admin', // Optional: recipient name
    reply_to: formData.email
  };

  return await sendEmail(templateParams);
};

// Send newsletter subscription email
export const sendNewsletterEmail = async (email) => {
  const templateParams = {
    subscriber_email: email,
    to_name: 'Admin',
    subject: 'New Newsletter Subscription'
  };

  return await sendEmail(templateParams);
};

// Send custom email with dynamic template parameters
export const sendCustomEmail = async (templateParams) => {
  return await sendEmail(templateParams);
};