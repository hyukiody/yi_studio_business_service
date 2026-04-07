'use client';

import { useState } from 'react';

/**
 * ContactForm — Production-Ready Lead Capture
 * 
 * Implements client-side validation and supports external API hosting 
 * for GitHub Pages compatibility.
 */

export function ContactForm() {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus('loading');
    setErrorMessage('');

    const formData = new FormData(event.currentTarget);
    const data = {
      name: formData.get('name'),
      email: formData.get('email'),
      message: formData.get('message'),
    };

    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || '';
      const response = await fetch(`${baseUrl}/api/v1/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setStatus('success');
      } else {
        setStatus('error');
        setErrorMessage(result.error || 'Failed to send message');
      }
    } catch (error) {
      console.error('Contact form submission failed:', error);
      setStatus('error');
      setErrorMessage('An unexpected error occurred. Please try again.');
    }
  }

  if (status === 'success') {
    return (
      <div className="p-8 bg-green-50 border-2 border-green-500 rounded-xl text-center">
        <h2 className="text-2xl font-bold text-green-700 mb-2">Message Sent!</h2>
        <p className="text-green-600">Thank you for reaching out. We will get back to you shortly.</p>
        <button 
          onClick={() => setStatus('idle')}
          className="mt-4 text-green-700 underline font-medium"
        >
          Send another message
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6 w-full max-w-md">
      <div className="flex flex-col gap-2">
        <label htmlFor="name" className="text-sm font-bold text-gray-700 uppercase tracking-wider">
          Name
        </label>
        <input
          id="name"
          name="name"
          required
          type="text"
          placeholder="Your name"
          className="p-4 border-4 border-[#E87A00] rounded-lg focus:ring-4 focus:ring-[#E87A00]/20 outline-none"
        />
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="email" className="text-sm font-bold text-gray-700 uppercase tracking-wider">
          Email
        </label>
        <input
          id="email"
          name="email"
          required
          type="email"
          placeholder="your@email.com"
          className="p-4 border-4 border-[#E87A00] rounded-lg focus:ring-4 focus:ring-[#E87A00]/20 outline-none"
        />
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="message" className="text-sm font-bold text-gray-700 uppercase tracking-wider">
          Message
        </label>
        <textarea
          id="message"
          name="message"
          required
          rows={4}
          placeholder="How can we help?"
          className="p-4 border-4 border-[#E87A00] rounded-lg focus:ring-4 focus:ring-[#E87A00]/20 outline-none transition-all"
        />
      </div>

      {status === 'error' && (
        <div className="p-4 bg-red-50 border-2 border-red-500 rounded-lg text-red-700 text-sm">
          {errorMessage}
        </div>
      )}

      <button
        type="submit"
        disabled={status === 'loading'}
        className="mt-4 p-4 bg-[#E87A00] text-white font-bold rounded-lg shadow-lg hover:bg-[#FF8A00] active:scale-95 transition-all disabled:opacity-50 disabled:scale-100"
      >
        {status === 'loading' ? 'Sending...' : 'Send Message'}
      </button>
    </form>
  );
}
