<?php

namespace App\Mail;

use App\Models\ProblemReport;
use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Address;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class ProblemReportSubmittedMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public ProblemReport $report,
        public ?User $reporterUser = null,
    ) {}

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        $replyTo = [];
        if ($this->reporterUser && !empty($this->reporterUser->email)) {
            $replyTo[] = new Address($this->reporterUser->email, $this->reporterUser->name ?: null);
        } elseif (!empty($this->report->email)) {
            $replyTo[] = new Address($this->report->email);
        }

        return new Envelope(
            subject: 'New Problem Report - OJT Hours Tracker',
            replyTo: $replyTo,
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        return new Content(
            view: 'emails.problem-report',
            with: [
                'report' => $this->report,
                'reporterUser' => $this->reporterUser,
                'submittedAt' => ($this->report->created_at ?? now())->format('F j, Y \a\t g:i A T'),
            ],
        );
    }
}
