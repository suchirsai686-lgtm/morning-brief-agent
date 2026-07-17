# ☀️ Morning Brief Agent

> An AI-powered productivity assistant that runs every morning at 6 AM, gathers your tasks, and delivers a personalized briefing to your inbox — before you wake up.

Built with **AWS Lambda**, **Amazon Bedrock (Nova Lite)**, **DynamoDB**, **SES**, **EventBridge Scheduler**, and **React + Vite + TailwindCSS**, deployed via **AWS SAM** and **AWS Amplify**.

---

## 📸 Features

- **First-Time Setup** — Enter your name, email, timezone, city, and tasks once
- **AI Morning Briefing** — Amazon Bedrock Nova Lite generates a personalized, concise brief
- **Email Delivery** — Beautifully formatted HTML email via Amazon SES
- **Dashboard** — View your brief, tasks, and agent status
- **Settings** — Update your profile and tasks at any time
- **Scheduler** — EventBridge triggers Lambda at 6 AM UTC every day automatically

---

## 🗂️ Project Structure

```
morning-brief-agent/
├── backend/
│   ├── save_profile.py        # Lambda: save/get user profile
│   ├── generate_brief.py      # Lambda: generate AI brief + scheduled handler
│   ├── send_email.py          # Lambda: send HTML email via SES
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── LandingPage.tsx
│   │   │   ├── SetupPage.tsx
│   │   │   ├── DashboardPage.tsx
│   │   │   ├── SettingsPage.tsx
│   │   │   └── SignInPage.tsx
│   │   ├── components/ui/     # shadcn/ui components
│   │   ├── hooks/use-toast.ts
│   │   ├── lib/utils.ts
│   │   ├── api.ts             # API client
│   │   ├── types.ts
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── package.json
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   └── .env.example
├── template.yaml              # AWS SAM template
├── amplify.yml                # AWS Amplify build config
├── samconfig.toml.example     # SAM deploy config template
└── README.md
```

---

## 🚀 Deployment Guide

### Prerequisites

- [AWS CLI](https://aws.amazon.com/cli/) configured (`aws configure`)
- [AWS SAM CLI](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/install-sam-cli.html) installed
- [Node.js 18+](https://nodejs.org/) installed
- Python 3.12 installed
- An [AWS account](https://aws.amazon.com/free/) (Free Tier eligible)

---

### Step 1: Verify SES Email

Before deploying, you must verify your sender email in Amazon SES:

```bash
aws ses verify-email-identity \
  --email-address your@email.com \
  --region us-east-1
```

> **Note:** In SES sandbox mode (default), you must also verify the **recipient** email address.
> To send to unverified addresses, [request production access](https://docs.aws.amazon.com/ses/latest/dg/request-production-access.html).

---

### Step 2: Enable Amazon Bedrock Model Access

1. Go to [Amazon Bedrock Console](https://console.aws.amazon.com/bedrock/)
2. Navigate to **Model access**
3. Enable access to **Amazon Nova Lite** (`amazon.nova-lite-v1:0`)

---

### Step 3: Deploy Backend (AWS SAM)

```bash
# Clone / navigate to project
cd morning-brief-agent

# Build
sam build

# Deploy (interactive first time)
sam deploy --guided \
  --parameter-overrides \
    SesSenderEmail=your@email.com \
    FrontendUrl=http://localhost:5173

# Note the API Gateway URL from the output:
# ApiEndpoint = https://xxxxxxxxxx.execute-api.us-east-1.amazonaws.com/prod
```

> After first deploy, copy `samconfig.toml.example` to `samconfig.toml` and fill in values.
> Subsequent deploys: just run `sam deploy`

---

### Step 4: Configure Frontend Environment

```bash
cd frontend
cp .env.example .env
```

Edit `.env`:
```
VITE_API_URL=https://xxxxxxxxxx.execute-api.us-east-1.amazonaws.com/prod
```

---

### Step 5: Run Frontend Locally

```bash
cd frontend
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

---

### Step 6: Deploy Frontend to AWS Amplify

1. Push this project to a GitHub/GitLab/Bitbucket repository
2. Go to [AWS Amplify Console](https://console.aws.amazon.com/amplify/)
3. Click **"New app"** → **"Host web app"**
4. Connect your repository and select the branch
5. Amplify will auto-detect `amplify.yml` — click **Save and deploy**
6. After deploy, go to **Environment variables** and add:
   ```
   VITE_API_URL = https://xxxxxxxxxx.execute-api.us-east-1.amazonaws.com/prod
   ```
7. Redeploy the app

---

### Step 7: Update CORS for Production

After getting your Amplify URL, redeploy the backend with it:

```bash
sam deploy \
  --parameter-overrides \
    SesSenderEmail=your@email.com \
    FrontendUrl=https://your-app.amplifyapp.com
```

---

## 🗄️ DynamoDB Schema

**Table:** `morning-brief-users`
**Billing:** PAY_PER_REQUEST (Free Tier: 25 GB + 25 WCU/RCU)

| Attribute | Type | Description |
|---|---|---|
| `email` | String (PK) | User's email address |
| `name` | String | Full name |
| `timezone` | String | IANA timezone (e.g. `Asia/Kolkata`) |
| `city` | String | User's city |
| `wake_time` | String | Wake-up time (e.g. `06:00`) |
| `tasks` | List | Today's task list |
| `lastBrief` | String | Last generated brief (markdown) |
| `lastGenerated` | String | ISO timestamp of last generation |
| `createdAt` | String | Profile creation timestamp |
| `updatedAt` | String | Last update timestamp |

---

## ⚡ Lambda Functions

| Function | Handler | Trigger | Description |
|---|---|---|---|
| `morning-brief-save-profile` | `save_profile.handler` | API Gateway POST/GET `/profile` | Save/retrieve user profile |
| `morning-brief-generate` | `generate_brief.handler` | API Gateway POST `/generate` | Generate brief on demand |
| `morning-brief-scheduled` | `generate_brief.scheduled_handler` | EventBridge cron | Generate + email all users at 6 AM |
| `morning-brief-send-email` | `send_email.handler` | API Gateway POST `/send-email` | Send brief via SES |

---

## 📅 Scheduler Configuration

The EventBridge Scheduler uses: `cron(0 0 * * ? *)`

This fires at **00:00 UTC = 6:00 AM IST / 8:00 PM ET (previous day)**.

To adjust the time, edit `template.yaml`:

```yaml
ScheduleExpression: cron(0 1 * * ? *)   # 1 AM UTC = 6:30 AM IST
```

Common conversions:
| Local Time | UTC Cron |
|---|---|
| 6:00 AM EST | `cron(11 0 * * ? *)` |
| 6:00 AM IST | `cron(30 0 * * ? *)` |
| 6:00 AM UTC | `cron(0 0 * * ? *)` |
| 6:00 AM PST | `cron(0 14 * * ? *)` |

---

## 🤖 Bedrock Prompt Design

The AI briefing prompt instructs Nova Lite to:
- Write a warm, personalized greeting referencing the date
- Prioritize tasks in logical order
- Suggest 2–3 focus time blocks
- Give one specific productivity tip
- Close with a motivational sentence

Response is constrained to **under 300 words** and formatted in clean markdown.

---

## 💰 AWS Cost Estimate (Free Tier)

| Service | Free Tier | MVP Usage |
|---|---|---|
| Lambda | 1M requests/month | ~30/month ✅ |
| DynamoDB | 25 GB + 25 WCU/RCU | < 1 MB ✅ |
| API Gateway | 1M calls/month | ~100/month ✅ |
| SES | 62,000 emails/month (from EC2) | ~30/month ✅ |
| Bedrock | Pay per token | ~$0.01/day |
| EventBridge | 14M events/month | 30 events ✅ |
| Amplify | 5 GB storage, 15 GB transfer | Well within ✅ |

**Estimated monthly cost: < $1** (primarily Bedrock inference)

---

## 🔧 Environment Variables

### Backend (Lambda — set via SAM parameters)

| Variable | Description |
|---|---|
| `DYNAMODB_TABLE` | DynamoDB table name (auto-set) |
| `SES_SENDER_EMAIL` | Verified SES sender address |
| `BEDROCK_MODEL_ID` | `amazon.nova-lite-v1:0` |
| `ALLOWED_ORIGIN` | Frontend URL for CORS |

### Frontend

| Variable | Description |
|---|---|
| `VITE_API_URL` | API Gateway endpoint URL |

---

## 🛠️ Development Commands

```bash
# Backend: local testing
sam local invoke SaveProfileFunction --event events/save_profile.json

# Frontend: development server
cd frontend && npm run dev

# Frontend: production build
cd frontend && npm run build

# Deploy backend changes
sam build && sam deploy

# View Lambda logs
sam logs -n morning-brief-generate --tail
```

---

## 🔐 IAM Permissions

The Lambda execution role (`morning-brief-lambda-role`) has:
- `dynamodb:GetItem`, `PutItem`, `UpdateItem`, `Scan` on the users table
- `bedrock:InvokeModel` for Nova Lite
- `ses:SendEmail`, `ses:SendRawEmail`
- `logs:*` via `AWSLambdaBasicExecutionRole`

---

## 🧪 Testing the API

```bash
# Save profile
curl -X POST https://YOUR_API_URL/profile \
  -H "Content-Type: application/json" \
  -d '{"email":"you@example.com","name":"Alex","timezone":"UTC","city":"NYC","wake_time":"06:00","tasks":["Task 1","Task 2"]}'

# Get profile
curl https://YOUR_API_URL/profile/you@example.com

# Generate brief
curl -X POST https://YOUR_API_URL/generate \
  -H "Content-Type: application/json" \
  -d '{"email":"you@example.com","sendEmail":false}'
```

---

## 📬 SES Sandbox Note

In SES sandbox mode, emails can only be sent to **verified email addresses**.

To verify your recipient email:
```bash
aws ses verify-email-identity --email-address recipient@example.com
```

For production use, request SES production access in the AWS Console.

---

## 🏗️ Architecture Diagram

```
User Browser
    │
    ▼
AWS Amplify (React + Vite + TypeScript)
    │
    ▼
API Gateway (REST)
    ├──► save_profile Lambda ──► DynamoDB
    ├──► generate_brief Lambda ──► Bedrock Nova Lite ──► DynamoDB
    └──► send_email Lambda ──► SES

EventBridge Scheduler (cron: 6 AM UTC)
    └──► scheduled Lambda ──► DynamoDB (scan all users)
                           ──► Bedrock Nova Lite (generate)
                           ──► SES (email each user)
```

---

Built as an AWS Full-Stack MVP · Powered by Amazon Bedrock Nova Lite
