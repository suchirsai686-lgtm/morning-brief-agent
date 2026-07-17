import json
import boto3
import os
import html

ses = boto3.client('ses')
SENDER_EMAIL = os.environ.get('SES_SENDER_EMAIL', 'briefing@yourdomain.com')


def _cors_headers():
    return {
        'Access-Control-Allow-Origin': os.environ.get('ALLOWED_ORIGIN', '*'),
        'Access-Control-Allow-Headers': 'Content-Type,Authorization',
        'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
        'Content-Type': 'application/json',
    }


def _response(status_code: int, body: dict) -> dict:
    return {
        'statusCode': status_code,
        'headers': _cors_headers(),
        'body': json.dumps(body, default=str),
    }


def markdown_to_html(text: str) -> str:
    """Lightweight markdown → HTML for email body."""
    import re

    lines = text.split('\n')
    html_lines = []
    in_list = False

    for line in lines:
        # Headers
        if line.startswith('### '):
            if in_list:
                html_lines.append('</ul>')
                in_list = False
            html_lines.append(f'<h3 style="color:#6366f1;margin:16px 0 4px">{html.escape(line[4:])}</h3>')
        elif line.startswith('## '):
            if in_list:
                html_lines.append('</ul>')
                in_list = False
            html_lines.append(f'<h2 style="color:#4f46e5;margin:20px 0 6px">{html.escape(line[3:])}</h2>')
        elif line.startswith('# '):
            if in_list:
                html_lines.append('</ul>')
                in_list = False
            html_lines.append(f'<h1 style="color:#312e81;margin:0 0 12px">{html.escape(line[2:])}</h1>')
        elif line.startswith('- ') or (len(line) > 2 and line[0].isdigit() and line[1] in '.):'):
            if not in_list:
                html_lines.append('<ul style="margin:6px 0 6px 20px;padding:0">')
                in_list = True
            content = line[2:] if line.startswith('- ') else re.sub(r'^\d+[.)]\s*', '', line)
            # Bold within list items
            content = re.sub(r'\*\*(.+?)\*\*', r'<strong>\1</strong>', html.escape(content))
            html_lines.append(f'<li style="margin:4px 0">{content}</li>')
        elif line.strip() == '':
            if in_list:
                html_lines.append('</ul>')
                in_list = False
            html_lines.append('<br>')
        else:
            if in_list:
                html_lines.append('</ul>')
                in_list = False
            # Bold text
            content = re.sub(r'\*\*(.+?)\*\*', r'<strong>\1</strong>', html.escape(line))
            # Italic
            content = re.sub(r'\*(.+?)\*', r'<em>\1</em>', content)
            html_lines.append(f'<p style="margin:6px 0">{content}</p>')

    if in_list:
        html_lines.append('</ul>')

    return '\n'.join(html_lines)


def build_email_html(profile: dict, brief: str) -> tuple[str, str]:
    name = profile.get('name', 'there')
    brief_html = markdown_to_html(brief)

    html_body = f"""
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your Morning Brief</title>
</head>
<body style="margin:0;padding:0;background-color:#f8fafc;font-family:'Segoe UI',Arial,sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;padding:40px 20px">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08)">
          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#6366f1 0%,#8b5cf6 100%);padding:32px 40px;text-align:center">
              <div style="font-size:32px;margin-bottom:8px">☀️</div>
              <h1 style="margin:0;color:#ffffff;font-size:28px;font-weight:700;letter-spacing:-0.5px">
                Morning Brief
              </h1>
              <p style="margin:8px 0 0;color:rgba(255,255,255,0.8);font-size:14px">
                Your AI-powered daily briefing
              </p>
            </td>
          </tr>
          <!-- Content -->
          <tr>
            <td style="padding:32px 40px;color:#1e293b;font-size:16px;line-height:1.7">
              {brief_html}
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="background:#f8fafc;padding:24px 40px;text-align:center;border-top:1px solid #e2e8f0">
              <p style="margin:0;color:#94a3b8;font-size:13px">
                Morning Brief Agent · Powered by Amazon Bedrock Nova Lite
              </p>
              <p style="margin:6px 0 0;color:#94a3b8;font-size:12px">
                This briefing was automatically generated for {html.escape(name)}.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
"""
    text_body = f"Morning Brief\n\n{brief}\n\n---\nMorning Brief Agent · Powered by Amazon Bedrock"
    return html_body, text_body


def send_brief_email(profile: dict, brief: str) -> dict:
    """
    Core email send function. Called both from API handler and
    from generate_brief.scheduled_handler.
    """
    recipient = profile.get('email')
    name = profile.get('name', 'there')
    html_body, text_body = build_email_html(profile, brief)

    response = ses.send_email(
        Source=SENDER_EMAIL,
        Destination={'ToAddresses': [recipient]},
        Message={
            'Subject': {
                'Data': f'☀️ Your Morning Brief is ready, {name}!',
                'Charset': 'UTF-8',
            },
            'Body': {
                'Html': {'Data': html_body, 'Charset': 'UTF-8'},
                'Text': {'Data': text_body, 'Charset': 'UTF-8'},
            },
        },
    )
    return response


def handler(event, context):
    method = event.get('httpMethod', 'POST')

    if method == 'OPTIONS':
        return _response(200, {})

    try:
        body = json.loads(event.get('body', '{}'))
        profile = body.get('profile', {})
        brief = body.get('brief', '')

        if not profile.get('email'):
            return _response(400, {'error': 'Profile with email is required'})

        if not brief:
            return _response(400, {'error': 'Brief content is required'})

        result = send_brief_email(profile, brief)
        message_id = result.get('MessageId', '')

        return _response(200, {
            'message': 'Email sent successfully',
            'messageId': message_id,
        })

    except ses.exceptions.MessageRejected as e:
        return _response(400, {'error': f'Email rejected: {str(e)}'})
    except ses.exceptions.MailFromDomainNotVerifiedException as e:
        return _response(400, {'error': 'Sender email not verified in SES'})
    except Exception as e:
        print(f'Error sending email: {e}')
        return _response(500, {'error': f'Failed to send email: {str(e)}'})
