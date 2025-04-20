'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { IoMdSend, IoMdCheckmark, IoMdMail } from 'react-icons/io';

interface Props {
  billId: string;
  contactId: string;
  contactEmail: string;
}

export default function SendEmailLinkButton({ billId, contactId, contactEmail }: Props) {
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSend = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ billId, contactId }),
      });

      const data = await response.json();
      if (data.success) {
        setSent(true);
        setTimeout(() => setSent(false), 3000); // Reset after 3s
      } else {
        alert('Failed to send email');
      }
    } catch (err) {
      console.error('Email send error:', err);
      alert('Failed to send email');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      disabled={loading || sent}
      onClick={handleSend}
      className="flex items-center gap-2"
    >
      {loading ? (
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
      ) : sent ? (
        <>
          <IoMdCheckmark className="w-4 h-4" /> Sent!
        </>
      ) : (
        <>
          <IoMdMail className="w-4 h-4" /> Email Link
        </>
      )}
    </Button>
  );
}
