<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Feedback Reply</title>
</head>
<body style="margin:0; padding:24px; background:#f8fafc; font-family:Arial, Helvetica, sans-serif; color:#0f172a;">
    <div style="max-width:640px; margin:0 auto; background:#ffffff; border:1px solid #e2e8f0; padding:32px;">
        <p style="margin:0 0 16px; font-size:14px; color:#475569;">
            Hello {{ $feedbackMessage->user?->name ?: 'there' }},
        </p>

        <h1 style="margin:0 0 16px; font-size:22px; color:#0f172a;">You received a reply from the admin team</h1>

        <p style="margin:0 0 8px; font-size:14px; color:#475569;">
            Your original subject:
        </p>
        <p style="margin:0 0 24px; padding:12px 16px; background:#f8fafc; border-left:4px solid #0f172a; font-size:15px;">
            {{ $feedbackMessage->subject }}
        </p>

        <p style="margin:0 0 8px; font-size:14px; color:#475569;">
            Admin reply:
        </p>
        <div style="margin:0 0 24px; padding:16px; background:#f8fafc; border:1px solid #e2e8f0; white-space:pre-line; font-size:15px; line-height:1.6;">
            {{ $replyMessage }}
        </div>

        <p style="margin:0; font-size:13px; color:#64748b;">
            This email was sent in response to your message in the tracker application.
        </p>
    </div>
</body>
</html>
