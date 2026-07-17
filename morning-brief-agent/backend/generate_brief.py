import json
import boto3
import os
from datetime import datetime, timezone

dynamodb = boto3.resource('dynamodb')
bedrock = boto3.client('bedrock-runtime')
table = dynamodb.Table(os.environ['DYNAMODB_TABLE'])
MODEL_ID = os.environ.get('BEDROCK_MODEL_ID', 'amazon.nova-lite-v1:0')


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


def build_prompt(profile: dict) -> str:
    name = profile.get('name', 'there')
    city = profile.get('city', '')
    timezone_str = profile.get('timezone', 'UTC')
    tasks = profile.get('tasks', [])

    tasks_text = '\n'.join(f'  {i+1}. {t}' for i, t in enumerate(tasks)) if tasks else '  No tasks listed.'
    today = datetime.now(timezone.utc).strftime('%A, %B %d, %Y')

    prompt = f"""You are a motivating and efficient morning briefing assistant. Generate a concise, energizing morning brief for {name}.

User Profile:
- Name: {name}
- City: {city}
- Timezone: {timezone_str}
- Date: {today}

Today's Tasks:
{tasks_text}

Generate a morning briefing in markdown format with these EXACT sections:
1. A warm, personalized greeting (1 sentence)
2. **Today's Priorities** - List the tasks in logical order with brief reasoning
3. **Focus Blocks** - Suggest 2-3 time blocks (e.g., 9:00–11:00 AM: Deep work)
4. **Productivity Tip** - One specific, actionable tip
5. **Motivation** - One powerful sentence to start the day

Rules:
- Be encouraging and energizing, not generic
- Keep the total response under 300 words
- Use clean markdown formatting
- No fluff or filler content
- Make the greeting reference the day/date
"""
    return prompt


def invoke_bedrock(prompt: str) -> str:
    messages = [
        {
            'role': 'user',
            'content': [{'text': prompt}]
        }
    ]

    payload = {
        'messages': messages,
        'inferenceConfig': {
            'maxTokens': 512,
            'temperature': 0.7,
            'topP': 0.9,
        }
    }

    response = bedrock.invoke_model(
        modelId=MODEL_ID,
        body=json.dumps(payload),
        contentType='application/json',
        accept='application/json',
    )

    result = json.loads(response['body'].read())
    return result['output']['message']['content'][0]['text']


def save_brief_to_db(email: str, brief: str):
    now = datetime.now(timezone.utc).isoformat()
    table.update_item(
        Key={'email': email},
        UpdateExpression='SET lastBrief = :b, lastGenerated = :t',
        ExpressionAttributeValues={':b': brief, ':t': now},
    )


def handler(event, context):
    method = event.get('httpMethod', 'POST')

    if method == 'OPTIONS':
        return _response(200, {})

    try:
        body = json.loads(event.get('body', '{}'))
        email = body.get('email', '').strip().lower()

        if not email:
            return _response(400, {'error': 'Email is required'})

        db_response = table.get_item(Key={'email': email})
        profile = db_response.get('Item')

        if not profile:
            return _response(404, {'error': 'Profile not found. Please complete setup first.'})

        prompt = build_prompt(profile)
        brief_text = invoke_bedrock(prompt)

        save_brief_to_db(email, brief_text)

        # Optionally trigger email
        send_email_on_generate = body.get('sendEmail', False)
        if send_email_on_generate:
            _send_email_internally(profile, brief_text)

        return _response(200, {
            'brief': brief_text,
            'generatedAt': datetime.now(timezone.utc).isoformat(),
            'email': email,
        })

    except json.JSONDecodeError:
        return _response(400, {'error': 'Invalid JSON body'})
    except bedrock.exceptions.ThrottlingException:
        return _response(429, {'error': 'AI model is busy. Please try again in a moment.'})
    except Exception as e:
        print(f'Error generating brief: {e}')
        return _response(500, {'error': f'Failed to generate brief: {str(e)}'})


def _send_email_internally(profile: dict, brief: str):
    """Internal call to SES — reused by scheduled handler."""
    import send_email as se
    se.send_brief_email(profile, brief)


def scheduled_handler(event, context):
    """
    EventBridge Scheduler trigger — runs daily at 6 AM UTC.
    Generates and emails briefs for all users in DynamoDB.
    """
    print('Scheduled brief generation started')

    scan_response = table.scan()
    users = scan_response.get('Items', [])

    results = []
    for profile in users:
        email = profile.get('email')
        try:
            prompt = build_prompt(profile)
            brief_text = invoke_bedrock(prompt)
            save_brief_to_db(email, brief_text)
            _send_email_internally(profile, brief_text)
            results.append({'email': email, 'status': 'success'})
            print(f'Brief sent to {email}')
        except Exception as e:
            print(f'Failed for {email}: {e}')
            results.append({'email': email, 'status': 'error', 'error': str(e)})

    return {'processed': len(results), 'results': results}
