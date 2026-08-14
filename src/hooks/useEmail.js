import { useState } from 'react';
import { sendContactEmail, sendNewsletterEmail, sendCustomEmail } from '../services/emailService';

export const useEmail = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const sendContactForm = async (formData) => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const result = await sendContactEmail(formData);
      if (result.success) {
        setSuccess(true);
        return { success: true };
      } else {
        setError(result.error);
        return { success: false, error: result.error };
      }
    } catch (err) {
      const errorMessage = err.message || 'Failed to send email';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const sendNewsletter = async (email) => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const result = await sendNewsletterEmail(email);
      if (result.success) {
        setSuccess(true);
        return { success: true };
      } else {
        setError(result.error);
        return { success: false, error: result.error };
      }
    } catch (err) {
      const errorMessage = err.message || 'Failed to subscribe';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const sendCustom = async (templateParams) => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const result = await sendCustomEmail(templateParams);
      if (result.success) {
        setSuccess(true);
        return { success: true };
      } else {
        setError(result.error);
        return { success: false, error: result.error };
      }
    } catch (err) {
      const errorMessage = err.message || 'Failed to send email';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const resetStatus = () => {
    setError(null);
    setSuccess(false);
  };

  return {
    loading,
    error,
    success,
    sendContactForm,
    sendNewsletter,
    sendCustom,
    resetStatus
  };
};