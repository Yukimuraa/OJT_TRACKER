<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>New Problem Report - OJT Hours Tracker</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #142b49; background-color: #f8fafc; margin: 0; padding: 24px;">
    <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 28px;">
        <h2 style="margin: 0 0 8px 0; font-size: 20px; color: #142b49;">
            New Problem Report - OJT Hours Tracker
        </h2>
        <p style="margin: 0 0 20px 0; font-size: 14px; color: #64748b;">
            A new issue has been submitted through the Report a Problem form.
        </p>

        <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 14px;">
            <tr>
                <td style="padding: 8px 0; color: #64748b; width: 160px; vertical-align: top;"><strong>Report ID</strong></td>
                <td style="padding: 8px 0; color: #142b49;">#{{ $report->id }}</td>
            </tr>
            <tr>
                <td style="padding: 8px 0; color: #64748b; vertical-align: top;"><strong>Problem Category</strong></td>
                <td style="padding: 8px 0; color: #142b49;">{{ $report->category }}</td>
            </tr>
            <tr>
                <td style="padding: 8px 0; color: #64748b; vertical-align: top;"><strong>Submitted At</strong></td>
                <td style="padding: 8px 0; color: #142b49;">{{ $submittedAt }}</td>
            </tr>
            @if ($reporterUser)
                <tr>
                    <td style="padding: 8px 0; color: #64748b; vertical-align: top;"><strong>Submitted By</strong></td>
                    <td style="padding: 8px 0; color: #142b49;">Authenticated Student</td>
                </tr>
                <tr>
                    <td style="padding: 8px 0; color: #64748b; vertical-align: top;"><strong>Student Name</strong></td>
                    <td style="padding: 8px 0; color: #142b49;">{{ $reporterUser->name }}</td>
                </tr>
                <tr>
                    <td style="padding: 8px 0; color: #64748b; vertical-align: top;"><strong>Student Email</strong></td>
                    <td style="padding: 8px 0; color: #142b49;">{{ $reporterUser->email }}</td>
                </tr>
            @else
                <tr>
                    <td style="padding: 8px 0; color: #64748b; vertical-align: top;"><strong>Submitted By</strong></td>
                    <td style="padding: 8px 0; color: #142b49;">Public Visitor</td>
                </tr>
                <tr>
                    <td style="padding: 8px 0; color: #64748b; vertical-align: top;"><strong>Visitor Email</strong></td>
                    <td style="padding: 8px 0; color: #142b49;">{{ $report->email }}</td>
                </tr>
            @endif
        </table>

        <div style="border-top: 1px solid #e2e8f0; padding-top: 16px;">
            <div style="font-size: 13px; font-weight: 700; color: #142b49; margin-bottom: 8px;">
                Problem Description
            </div>
            <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 14px; font-size: 14px; line-height: 1.6; color: #334155; white-space: pre-wrap;">{{ $report->description }}</div>
        </div>
    </div>
</body>
</html>
