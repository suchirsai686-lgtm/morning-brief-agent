import json
import boto3
import os
import urllib.parse
from datetime import datetime, timezone
from decimal import Decimal

dynamodb = boto3.resource('dynamodb')
table = dynamodb.Table(os.environ['DYNAMODB_TABLE'])


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


def handler(event, context):
    method = event.get('httpMethod', 'GET')

    if method == 'OPTIONS':
        return _response(200, {})

    if method == 'POST':
        return save_profile(event)

    if method == 'GET':
        return get_profile(event)

    return _response(405, {'error': 'Method not allowed'})


def save_profile(event):
    try:
        body = json.loads(event.get('body', '{}'))

        required_fields = ['email', 'name', 'timezone', 'city', 'wake_time']
        for field in required_fields:
            if not body.get(field):
                return _response(400, {'error': f'Missing required field: {field}'})

        email = body['email'].strip().lower()
        tasks = body.get('tasks', [])

        if isinstance(tasks, str):
            tasks = [t.strip() for t in tasks.split('\n') if t.strip()]

        item = {
            'email': email,
            'name': body['name'].strip(),
            'timezone': body['timezone'],
            'city': body['city'].strip(),
            'wake_time': body['wake_time'],
            'tasks': tasks,
            'createdAt': datetime.now(timezone.utc).isoformat(),
            'updatedAt': datetime.now(timezone.utc).isoformat(),
            'lastBrief': body.get('lastBrief', ''),
            'lastGenerated': body.get('lastGenerated', ''),
        }

        table.put_item(Item=item)

        return _response(200, {
            'message': 'Profile saved successfully',
            'email': email,
        })

    except json.JSONDecodeError:
        return _response(400, {'error': 'Invalid JSON body'})
    except Exception as e:
        print(f'Error saving profile: {e}')
        return _response(500, {'error': 'Internal server error'})


def get_profile(event):
    try:
        query_params = event.get('queryStringParameters') or {}
        email = query_params.get('email', '')

        if not email:
            return _response(400, {'error': 'Email is required'})

        email = urllib.parse.unquote(email).strip().lower()
        response = table.get_item(Key={'email': email})
        item = response.get('Item')

        if not item:
            return _response(404, {'error': 'Profile not found'})

        return _response(200, item)

    except Exception as e:
        print(f'Error getting profile: {e}')
        return _response(500, {'error': 'Internal server error'})
