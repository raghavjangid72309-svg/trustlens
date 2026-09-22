# TrustLens 🔎

### Don't just search. Investigate.

TrustLens is an evidence-focused web research tool that helps users investigate claims by collecting live web results and organizing them into supporting, contradicting, and unclear evidence.

Instead of simply giving a "True" or "False" answer, TrustLens shows the evidence behind a claim and explains how the available sources were classified.

---

## 🚀 What is TrustLens?

The internet contains a huge amount of information, but finding reliable evidence can be difficult.

TrustLens turns a simple claim into an investigation:

**Claim → Web Research → Evidence Analysis → Evidence Balance → Report**

Example:

> "Is the iPhone 15 available in India?"

TrustLens searches the web, collects relevant results, analyzes the language and source type, and presents the findings in an easy-to-understand investigation dashboard.

---

## ✨ Features

### 🔎 Live Web Research
TrustLens searches the web for evidence related to the user's claim.

### 🧠 Evidence Classification
Search results are organized into:

- Supporting evidence
- Contradicting evidence
- Unclear evidence

### 🏛️ Source Intelligence
TrustLens identifies source types such as:

- Government
- Academic
- News
- General Web

Sources are also given a prototype quality classification based on their domain.

### ⚖️ Evidence Balance

TrustLens calculates an evidence balance using:

- Evidence classification
- Source quality
- Source diversity

This is an evidence signal, **not a probability that a claim is true**.

### 📊 Investigation Dashboard

The dashboard provides:

- Investigation summary
- Evidence categories
- Source information
- Evidence explanations
- Source diversity
- Methodology and limitations

### 📱 Responsive UI

The interface is designed to work across desktop and mobile screens.

---

## 🏗️ Tech Stack

- Next.js
- React
- TypeScript
- Tailwind CSS
- SerpApi
- Axios
- Next.js App Router

---

## 🧩 Architecture

```text
User Claim
    ↓
TrustLens Frontend
    ↓
Investigation API
    ↓
SerpApi
    ↓
Live Web Results
    ↓
Evidence Analysis API
    ↓
Source + Evidence Classification
    ↓
Evidence Balance
    ↓
Investigation Dashboard
