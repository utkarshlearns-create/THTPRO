Project: Credit-Based Tutoring Platform with Assessments

🧠 SYSTEM INTENT (ANTIGRAVITY CONTEXT)

You are building a two-sided marketplace with:

Parents ↔ Teachers

Credit-based contact unlocking

Optional agency commission flow

Assessment/quizzes for lead quality

Optimize for:

Lean MVP

High intent filtering

Extendability

🧩 AGENT ROLES (MENTAL MODEL)

Antigravity should internally reason as:

Product Agent → understands flows & constraints

Backend Agent → Django + DRF

Data Agent → schema & transactions

Guardrail Agent → fraud prevention

UX Logic Agent → unlock & assessment logic

📦 MODULE BREAKDOWN (VERY IMPORTANT)
Module 1: Authentication & Roles

Goal: Identify Parent / Teacher / Admin

Tasks:

Phone/email based auth

Role assignment at signup

OTP verification flag

Output:

User model with role enum

Auth APIs

Module 2: Credit System (CORE ECONOMY)

Goal: Intent-based access to contacts

Rules:

Every user has a wallet

Credits are integers

No negative balances

All mutations logged

Tasks:

Wallet creation on user signup

Credit purchase endpoint (mock payment for MVP)

Credit deduction logic

Credit transaction ledger (immutable)

Guardrails:

Idempotent deductions

One unlock per user-pair

Module 3: Contact Unlock Logic

Goal: Controlled access to sensitive info

Rules:

Mask contacts by default

Unlock once → permanent

Unlock via:

Credits

Agency commission

Tasks:

Contact masking service

Unlock validation

Unlock persistence

Anti-Abuse:

Daily unlock limit

Duplicate unlock prevention

Module 4: Tuition Marketplace

Goal: Supply–demand matching

Tasks:

Parent posts tuition request

Teacher browses requests

Filters by subject, class, location

Status lifecycle (open/matched/closed)

Module 5: Assessment / Quiz Engine

Goal: Increase trust & match quality

Constraints:

Optional

Short (10–15 MCQs)

Subject/class scoped

Tasks:

Assessment creation

Question bank

Randomized quiz attempt

Scoring logic

Level classification

Output:

Assessment summary visible to teachers

Detailed report optional (paid later)

Module 6: Commission (Agency Flow)

Goal: Trust fallback for hesitant users

Tasks:

Create commission deal

Admin approval flow

Status transitions

Manual closure

Note:

No payment automation in MVP

Admin-driven resolution

Module 7: Admin Control Panel

Goal: Operability & trust

Tasks:

Approve teachers

Upload assessment questions

Adjust credits

Monitor unlocks

Resolve disputes

🗂️ DATA MODELS (ANTIGRAVITY SHOULD GENERATE)

Mandatory:

User

TeacherProfile

TuitionRequest

CreditsWallet

CreditTransaction

ContactUnlock

CommissionDeal

Assessment

Question

AssessmentAttempt

AssessmentInsight

All relations must be explicit & indexed.

🔁 SYSTEM FLOWS (EXECUTION LOGIC)
Parent Unlock Flow
if credits >= required:
    deduct credits
    create ContactUnlock
    reveal teacher contact
else:
    offer agency option

Assessment Flow
start assessment
randomize questions
calculate score
assign level
store insights

⚠️ NON-NEGOTIABLE CONSTRAINTS

Antigravity MUST:

Keep assessment optional

Never auto-deduct credits

Never show full contact without unlock

Never allow multiple charges for same unlock

Prefer simplicity over features

🧪 MVP TEST CASES (AGENT SHOULD AUTO-GENERATE)

Wallet never negative

Duplicate unlock blocked

Assessment score correct

Role-based access enforced

Contact visibility correct

⏱️ EXECUTION ORDER (STRICT)

User + Auth

Wallet + Credits

Unlock system

Tuition marketplace

Assessments

Admin tools

Commission flow

🧠 SUCCESS DEFINITION

Credits → Unlock → Conversion

Assessment → Higher unlock rate

Minimal tutor complaints

Admin override possible everywhere

🛑 DO NOT BUILD (FOR NOW)

AI matching

Subscriptions

Chat system

Video classes

Gamification

END ANTIGRAVITY INSTRUCTION