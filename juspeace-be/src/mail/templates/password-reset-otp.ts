export function buildPasswordResetOtpEmail(input: {
  code: string;
  ttlMinutes: number;
}): { subject: string; text: string; html: string } {
  const subject = 'Your Juspeace password reset code';
  const text = [
    'You requested a password reset for your Juspeace Admin account.',
    '',
    `Your verification code is: ${input.code}`,
    '',
    `This code expires in ${input.ttlMinutes} minutes.`,
    'If you did not request this, you can ignore this email.',
  ].join('\n');

  const html = `<!DOCTYPE html>
<html lang="en">
  <body style="font-family: sans-serif; color: #1a1a1a; line-height: 1.5;">
    <p>You requested a password reset for your Juspeace Admin account.</p>
    <p style="font-size: 24px; font-weight: 700; letter-spacing: 4px;">${input.code}</p>
    <p>This code expires in ${input.ttlMinutes} minutes.</p>
    <p style="color: #666;">If you did not request this, you can ignore this email.</p>
  </body>
</html>`;

  return { subject, text, html };
}
