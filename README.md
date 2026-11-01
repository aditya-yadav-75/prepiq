# PrepIQ — AI-Powered Exam Practice Generator

> **Study smarter. Practice sharper.**
>
> Transform your notes, PDFs, and textbooks into personalised practice examinations with AI-generated questions, validated answer keys, and performance analytics.

<p align="center">
  <a href="https://prepiq-upc7.onrender.com/">
    <strong>Live Application</strong>
  </a>
  &nbsp; | &nbsp;
  <a href="https://github.com/aditya-yadav-75/prepiq">
    <strong>GitHub Repository</strong>
  </a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-18.3-61DAFB?logo=react&logoColor=black" />
  <img src="https://img.shields.io/badge/TypeScript-5.6-3178C6?logo=typescript&logoColor=white" />
  <img src="https://img.shields.io/badge/Node.js-v24-339933?logo=nodedotjs&logoColor=white" />
  <img src="https://img.shields.io/badge/AI-Google%20Gemini-4285F4?logo=google&logoColor=white" />
  <img src="https://img.shields.io/badge/License-MIT-lightgrey" />
</p>

---

## 1. Project Overview

PrepIQ is an AI-powered academic assessment platform developed under the category of **Student Productivity**.

Students often spend hours reviewing textbooks, lecture notes, and study materials but struggle to find relevant practice questions that accurately reflect their syllabus.

Traditional approaches often suffer from:

- Generic questions that are not aligned with the supplied study material.
- Incorrect or ambiguous answer keys.
- Repetitive questions testing the same concepts.
- Inconsistent evaluation of descriptive answers.
- Limited insight into individual learning gaps.

**PrepIQ addresses these challenges** by converting student-provided study materials into structured practice examinations. It uses AI-powered question generation, answer validation, automated evaluation, and performance analytics to make exam preparation more focused and effective.

## 2. Live Demo & Project Video

| Resource | Link |
|---|---|
| Live Application | https://prepiq-upc7.onrender.com/ |
| GitHub Repository | https://github.com/aditya-yadav-75/prepiq |
| Project Demonstration | **[Add your video link here]** |

### Project Demonstration Video

Watch the complete walkthrough of PrepIQ, including document uploads, AI question generation, practice examinations, automated evaluation, and performance analytics.

**Video Link:** `PASTE_YOUR_YOUTUBE_OR_GOOGLE_DRIVE_LINK_HERE`

<!-- Optional: Replace the placeholder above with a YouTube thumbnail link when your video is uploaded. -->

---

## 3. Key Features

### AI-Powered Question Generation
- Upload PDF, DOCX, and TXT study materials.
- Automatically extract and analyse educational content.
- Generate questions based on the uploaded material.
- Configure question count, difficulty, and question format.

### Customisable Practice Examinations
- Question count: 5–30 questions.
- Difficulty levels: Easy, Medium, Hard, and Mixed.
- Supported formats:
  - Multiple Choice Questions (MCQs)
  - True / False
  - Short Answer
  - Fill in the Blanks
  - Descriptive Questions

### Three Prompt Engineering Versions

PrepIQ implements three prompt versions to evaluate and improve question-generation quality.

| Version | Description |
|---|---|
| V1 — Baseline | Focuses on rapid factual recall. |
| V2 — Context-Aware | Incorporates topic distribution and Bloom's cognitive taxonomy. |
| V3 — Grounded & Rubric-Validated | Focuses on source grounding, duplicate rejection, and structured grading rubrics. |

### Answer Validation Engine
- Validates generated questions against source material.
- Checks MCQ answer consistency.
- Detects repetitive questions.
- Provides explanations and source references.
- Uses objective checkpoints for descriptive answer evaluation.

### Interactive Examination Interface
- Countdown timer.
- Interactive question palette.
- Question review flags.
- Submission confirmation.
- Structured examination experience.

### Automated Evaluation
- Automatically evaluates submitted answers.
- Calculates examination scores.
- Identifies weak topic areas.
- Generates feedback and explanations.
- Updates performance records.

### Performance Analytics
- Progression tracking.
- Subject-wise performance.
- Difficulty-wise accuracy.
- Weak-topic identification.
- Visual performance dashboards.

### Additional Features
- Internal academic validation test suite.
- Secure authentication and user-specific data access.
- Apple-inspired Liquid Glass interface.
- Responsive application interface.

---

## 4. Technology Stack

### Frontend

| Technology | Purpose |
|---|---|
| React 18 | User interface |
| TypeScript | Type safety |
| Vite | Development and build tooling |
| Tailwind CSS | Styling and design system |
| Framer Motion | Animations and transitions |
| Lucide React | Icons |
| Recharts | Data visualisation |

### Backend

| Technology | Purpose |
|---|---|
| Node.js | Runtime environment |
| Express.js | REST API |
| TypeScript | Backend development |
| JSON Storage | Application data persistence |
| JWT | Authentication |
| Node.js Crypto / scrypt | Password hashing |
| Multer | File uploads |
| pdf-parse | PDF text extraction |
| Mammoth | DOCX text extraction |
| Google Gemini API | AI-powered generation |

---

## 5. System Architecture

PrepIQ follows a client-server architecture.

```text
                  STUDENT
                     |
                     v
            REACT FRONTEND
             (Vite + TS)
                     |
                     v
              EXPRESS API
                     |
          +----------+----------+
          |          |          |
          v          v          v
      AUTHENTICATION DOCUMENT   AI ENGINE
        (JWT)      PROCESSING  (GEMINI)
          |          |          |
          +----------+----------+
                     |
                     v
            QUESTION VALIDATION
                     |
                     v
             PRACTICE EXAM
                     |
                     v
             AUTO EVALUATION
                     |
                     v
            PERFORMANCE ANALYTICS
                     |
                     v
               DATA STORAGE
```

### Project Structure

```text
prepiq/
│
├── client/
│   └── src/
│       ├── components/
│       │   ├── layout/
│       │   ├── ui/
│       │   └── test/
│       ├── context/
│       ├── pages/
│       ├── services/
│       └── types/
│
├── server/
│   ├── src/
│   │   ├── middleware/
│   │   ├── utils/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── data/
│   │   └── types/
│   ├── uploads/
│   └── .env.example
│
├── docs/
│   ├── workflow.md
│   ├── architecture.md
│   ├── prompt-engineering.md
│   └── testing-report.md
│
├── package.json
└── README.md
```

---

## 6. The 8-Stage Processing Workflow

PrepIQ follows an eight-stage workflow to transform study materials into evaluated practice examinations.

| Stage | Process | Description |
|---|---|---|
| 1 | Input | Student uploads a PDF, DOCX, TXT file, or pastes notes. |
| 2 | Extraction | Extracts and normalises text from the supplied material. |
| 3 | Analysis | Identifies headings, sections, concepts, and propositions. |
| 4 | Question Generation | Generates questions using the selected prompt version. |
| 5 | Answer Generation | Produces answers, explanations, references, and rubrics. |
| 6 | Validation | Checks source grounding, answer consistency, and duplicates. |
| 7 | Output & Storage | Stores the validated examination with ownership information. |
| 8 | Evaluation | Grades submissions, identifies weak topics, and updates analytics. |

---

## 7. Prompt Engineering & Validation

PrepIQ uses three prompt-engineering approaches to improve generated examination quality.

| Evaluation Metric | V1 | V2 | V3 |
|---|---:|---:|---:|
| Question Relevance | 82% | 93% | **98%** |
| Answer Accuracy | 85% | 94% | **99%** |
| Source Grounding | 78% | 89% | **98%** |
| Duplicate Detection | 70% | 88% | **97%** |
| Output Consistency | 84% | 92% | **98%** |

*Note: These are the evaluation figures documented for the project's prompt-version comparison. They should be interpreted in the context of the project's test methodology, not as independently verified benchmark results.*

### Internal Validation Suite

The application includes six documented academic validation scenarios:

1. Normal Input — Generate valid questions from supplied study material.
2. Empty Document — Reject insufficient input.
3. Unsupported Information — Detect questions not supported by the source.
4. Duplicate Detection — Identify and remove highly repetitive questions.
5. MCQ Consistency — Reject mismatches between options and answer keys.
6. Incomplete Submission — Handle unanswered questions during evaluation.

---

## 8. Security & Authentication

PrepIQ implements server-side authentication and resource ownership controls.

### JWT Authentication
- Uses signed HMAC-SHA256 JWT tokens.
- Protected API routes require `Authorization: Bearer <token>`.
- Validates token signatures, expiry, and required claims.
- Requires a `JWT_SECRET` of at least 32 characters.
- Does not trust client-provided user identity headers.

### Password Security
- Passwords are hashed using Node.js `crypto.scrypt`.
- Uses unique cryptographic salts.
- Uses timing-safe comparison during verification.
- Enforces password complexity requirements.

### Resource Ownership
- Protected routes validate authenticated users.
- Users can access only their own protected resources.
- Cross-user resource access is rejected.
- Shared system curriculum resources are protected from unauthorised modification.

### Rate Limiting
- Authentication endpoints: 25 requests per 15-minute window per IP.
- AI generation endpoints: 35 requests per 10-minute window per IP.

### Additional Security Measures
- Configurable CORS allowlist.
- Security response headers.
- File upload validation.
- 15 MB upload size limit.
- Filename sanitisation.
- Session validation and logout token cleanup.

---

## 9. Installation & Local Setup

### Prerequisites

- Node.js 18 or later.
- npm 9 or later.
- Git.
- Google Gemini API key (optional, for external AI generation).

### Step 1 — Clone the Repository

```bash
git clone https://github.com/aditya-yadav-75/prepiq.git

cd prepiq
```

### Step 2 — Install Dependencies

```bash
npm run install:all
```

### Step 3 — Configure Environment Variables

Create your environment file using the provided example:

```bash
cp server/.env.example server/.env
```

Configure the required variables:

```env
NODE_ENV=development
PORT=5001

JWT_SECRET=your_random_secret_at_least_32_characters

GEMINI_API_KEY=your_gemini_api_key
GEMINI_MODEL=gemini-1.5-flash

CORS_ORIGIN=http://localhost:3000
```

Use a unique, randomly generated secret for `JWT_SECRET`. Never commit real API keys or secrets to GitHub.

### Step 4 — Run the Application

```bash
npm run dev
```

### Step 5 — Production Build

```bash
npm run build

npm start
```

### Local Development URLs

| Service | URL |
|---|---|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:5001 |
| Health Check | http://localhost:5001/api/health |

---

## 10. Testing

### Security & Authorisation Audit

The repository includes a 15-point security and authorisation test harness.

```bash
cd server

npx tsx src/comprehensive_audit_test.ts
```

### Academic Validation Suite

The application also includes a six-scenario academic validation suite, accessible through the application's test-suite functionality.

Testing results should be considered verified only when the relevant test commands have been executed successfully in the current environment.

---

## 11. Deployment

PrepIQ is deployed using Render.

**Live Application:** https://prepiq-upc7.onrender.com/

### Deployment Environment Variables

| Variable | Purpose |
|---|---|
| `NODE_ENV` | Production environment |
| `PORT` | Server port |
| `JWT_SECRET` | Server-side JWT signing secret |
| `CORS_ORIGIN` | Allowed production frontend origin |
| `GEMINI_API_KEY` | Google Gemini API key |
| `GEMINI_MODEL` | Gemini model selection |
| `DATA_DIR` | Optional persistent storage directory |

### Important: Data Persistence

The current application uses JSON-based file storage.

Render's default filesystem on the Free plan is ephemeral. Data stored there may be lost after a restart or redeployment.

For persistent user data, configure a Render Persistent Disk on a supported paid plan, mount it at:

```text
/app/server/data
```

Then configure:

```env
DATA_DIR=/app/server/data
```

A managed database would be a suitable future improvement for a larger deployment.

---

## 12. Known Limitations & Future Scope

PrepIQ is an evolving academic productivity project. The following improvements are planned:

- **Handwritten Content Recognition:** Add OCR support for handwritten notes, equations, and diagrams.
- **Automated Password Reset:** Integrate institutional SMTP or an email delivery service.
- **LMS Integration:** Support Moodle and other Learning Management Systems.
- **Advanced Analytics:** Add deeper learning-pattern analysis and personalised study recommendations.
- **Database Migration:** Move from JSON-based storage to a managed database.
- **Scalability:** Introduce shared storage and distributed rate limiting for multi-instance deployments.
- **Export Support:** Enable examination export in standard academic formats.

---

## 13. Project Documentation

Additional technical documentation is available in the repository:

| Document | Description |
|---|---|
| `docs/workflow.md` | Application processing lifecycle |
| `docs/architecture.md` | System architecture and ERD |
| `docs/prompt-engineering.md` | Prompt versions and engineering approach |
| `docs/testing-report.md` | Validation and testing documentation |

---

## 14. Author

**Aditya Yadav**

B.Tech Computer Science & Engineering

- GitHub: https://github.com/aditya-yadav-75
- LinkedIn: https://www.linkedin.com/in/adityayadav75official/
- Project: https://github.com/aditya-yadav-75/prepiq

---

## 15. Acknowledgements

- Google Gemini for AI-powered question generation.
- The open-source React and Node.js ecosystems.
- The libraries and tools used throughout the development of PrepIQ.

---

<p align="center">
  <strong>PrepIQ — Study smarter. Practice sharper.</strong>
  <br />
  Built to make exam preparation more focused, structured, and effective.
</p>
