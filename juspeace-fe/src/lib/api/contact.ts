import { apiRequest } from './client';

export interface ContactInquiryInput {
  name: string;
  email: string;
  phone?: string;
  subject?: string;
  message: string;
  locale?: 'en' | 'ko';
}

export function createContactInquiry(input: ContactInquiryInput) {
  return apiRequest<{ id: string }>('/contact-inquiries', {
    method: 'POST',
    noStore: true,
    notify: 'both',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
}
