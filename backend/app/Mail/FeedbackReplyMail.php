<?php

namespace App\Mail;

use App\Models\FeedbackMessage;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class FeedbackReplyMail extends Mailable
{
    use Queueable;
    use SerializesModels;

    public function __construct(
        public FeedbackMessage $feedbackMessage,
        public string $replyMessage
    ) {
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Reply to your message: ' . $this->feedbackMessage->subject
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.feedback-reply'
        );
    }
}
