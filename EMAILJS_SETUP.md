# EmailJS Integration Setup

This project includes a complete EmailJS integration for sending emails directly from the frontend.

## Setup Instructions

1. Create an EmailJS account at [EmailJS](https://www.emailjs.com/)
2. Create an email service (Gmail, Outlook, etc.)
3. Create an email template
4. Get your credentials:
   - Service ID
   - Template ID
   - Public Key
5. Add your credentials to the `.env` file in the frontend directory:

```env
# EmailJS Configuration
VITE_EMAILJS_SERVICE_ID=your_service_id
VITE_EMAILJS_TEMPLATE_ID=your_template_id
VITE_EMAILJS_PUBLIC_KEY=your_public_key
```

## Project Structure

```
src/
├── services/
│   ├── emailjs.js         # EmailJS configuration
│   └── emailService.js    # Email sending functions
├── hooks/
│   └── useEmail.js        # Custom hook for email operations

```

## Available Services

### Email Service (`src/services/emailService.js`)
- `sendEmail(templateParams)` - Send email with custom template parameters
- `sendContactEmail(formData)` - Send contact form email
- `sendNewsletterEmail(email)` - Send newsletter subscription email
- `sendCustomEmail(templateParams)` - Send custom email

### Custom Hook (`src/hooks/useEmail.js`)
- `sendContactForm(formData)` - Send contact form with loading/error/success states
- `sendNewsletter(email)` - Send newsletter subscription
- `sendCustom(templateParams)` - Send custom email
- `loading` - Loading state
- `error` - Error message
- `success` - Success state
- `resetStatus()` - Reset error/success states

## Usage Examples

### Using the Contact Form Component
```jsx
import ContactForm from './components/ContactForm';

const MyPage = () => {
  return (
    <div>
      <h1>Contact Us</h1>
      <ContactForm />
    </div>
  );
};
```

### Using the Newsletter Form Component
```jsx
import NewsletterForm from './components/NewsletterForm';

const Footer = () => {
  return (
    <footer>
      <NewsletterForm />
    </footer>
  );
};
```

### Using the Hook Directly
```jsx
import { useEmail } from '../hooks/useEmail';

const CustomForm = () => {
  const { sendCustom, loading, error, success } = useEmail();

  const handleSend = async () => {
    const result = await sendCustom({
      to_email: 'admin@example.com',
      subject: 'Custom Subject',
      message: 'Custom message content'
    });
  };

  return (
    <div>
      <button onClick={handleSend} disabled={loading}>
        {loading ? 'Sending...' : 'Send Custom Email'}
      </button>
      {error && <div className="error">{error}</div>}
      {success && <div className="success">Email sent!</div>}
    </div>
  );
};
```

## Email Template Setup

In your EmailJS dashboard, create a template with these variables for the contact form:
- `{{from_name}}` - Sender's name
- `{{from_email}}` - Sender's email
- `{{subject}}` - Email subject
- `{{message}}` - Email message
- `{{to_name}}` - Recipient name (optional)
- `{{reply_to}}` - Reply-to email

For newsletter subscriptions:
- `{{subscriber_email}}` - Subscriber's email
- `{{to_name}}` - Recipient name
- `{{subject}}` - Email subject

## Security Notes

- EmailJS public key is safe to expose in frontend code
- Service ID and Template ID are also safe to expose
- Never expose your EmailJS private key in frontend code
- Consider implementing rate limiting on your backend for production use