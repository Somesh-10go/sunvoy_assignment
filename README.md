#  Sunvoy Assignment

This project reverse-engineers a legacy web application to extract user data and the currently authenticated user's details. Since the application does not provide a public API, this solution simulates a browser session, handles CSRF tokens, maintains login cookies, and generates authenticated requests with HMAC signatures.

---

##  Features

- Logs in using CSRF nonce and form data
- Handles session cookies automatically
- Fetches user list via internal API
- Extracts tokens from settings page
- Creates HMAC `checkcode` for authentication
- Retrieves current user info securely
- Stores all results in `users.json`

---

## Tech Stack

- **Node.js** (v18+)
- **TypeScript**
- **Axios** + `axios-cookiejar-support`
- **Tough-Cookie**
- **Cheerio**
- **Crypto** (Node built-in)
- **fs** (Node built-in)

---

## Prerequisites

- Node.js (v18 or higher)
- npm (v9+)
- TypeScript (`npm install -g typescript`)
- ts-node (`npm install -g ts-node` or install locally)

---

##    Setup Instructions

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/sunvoy-assignment.git
cd sunvoy-challenge
```
### 2.  Install Dependencies
```bash
npm install
```
### 3. Run the Script
```bash
npm start
```
users.json will be created in the root directory with the fetched user data

---

## **Loom Demo Video**
https://www.loom.com/share/7743bf85309f4f4492b36c40266d4d53?sid=fc58148c-52aa-417b-a296-bdfbe98760de
