import axios, { AxiosInstance } from 'axios';
import { wrapper } from 'axios-cookiejar-support';
import { CookieJar } from 'tough-cookie';
import * as cheerio from 'cheerio';
import * as crypto from 'crypto';
import * as fs from 'fs';
import path from 'path';

// Configuration
const BASE_URL = 'https://challenge.sunvoy.com';
const EMAIL = 'your email';
const PASSWORD = 'your password';
const SECRET_KEY = 'mys3cr3t';
const OUTPUT_FILE = 'users.json';

// Create HTTP client with cookie support
const jar = new CookieJar();
const client: AxiosInstance = wrapper(
  axios.create({
    baseURL: BASE_URL,
    jar,
    withCredentials: true,
    headers: {
      'User-Agent': 'Mozilla/5.0',
    },
  })
);

// Utility type for payloads
type Payload = Record<string, string>;

// Fetch CSRF nonce token from login page
async function fetchLoginNonce(): Promise<string> {
  const response = await client.get('/login');
  const $ = cheerio.load(response.data);
  const nonce = $('input[name="nonce"]').val();

  if (!nonce || typeof nonce !== 'string') {
    throw new Error('Login nonce not found.');
  }

  return nonce;
}

// Perform login using email, password, and nonce
async function performLogin(nonce: string): Promise<void> {
  const response = await client.post(
    '/login',
    new URLSearchParams({
      username: EMAIL,
      password: PASSWORD,
      nonce,
    }),
    {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      maxRedirects: 0,
      validateStatus: (status) => status === 302,
    }
  );

  if (response.status === 302 && response.headers.location === '/list') {
    console.log('[✓] Login successful');
  } else {
    throw new Error('Login failed');
  }
}

// Fetch list of users from the protected API
async function getUserList(): Promise<any[]> {
  const response = await client.post('/api/users');
  return response.data;
}

// Fetch the currently authenticated user's info using HMAC-based checkcode
async function getCurrentUser(): Promise<any> {
  const response = await client.get('/settings/tokens');
  const $ = cheerio.load(response.data);

  const payload: Payload = {};

  $('input[type="hidden"]').each((_, el) => {
    const id = $(el).attr('id');
    const val = $(el).attr('value');
    if (id && val) {
      payload[id] = val;
    }
  });

  payload.timestamp = Math.floor(Date.now() / 1000).toString();

  const queryString = Object.keys(payload)
    .sort()
    .map((key) => `${key}=${encodeURIComponent(payload[key])}`)
    .join('&');

  const hmac = crypto.createHmac('sha1', SECRET_KEY);
  hmac.update(queryString);
  const checkcode = hmac.digest('hex').toUpperCase();

  const finalPayload = `${queryString}&checkcode=${checkcode}`;

  const apiResponse = await axios.post(
    'https://api.challenge.sunvoy.com/api/settings',
    finalPayload,
    {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Origin: BASE_URL,
        Referer: `${BASE_URL}/`,
        'User-Agent': 'Mozilla/5.0',
      },
    }
  );

  return apiResponse.data;
}

// Main execution
async function main(): Promise<void> {
  try {
    const nonce = await fetchLoginNonce();
    await performLogin(nonce);

    const users = await getUserList();
    const currentUser = await getCurrentUser();

    const combinedData = [...users.slice(0, 9), currentUser];
    const outputPath = path.resolve(__dirname, OUTPUT_FILE);

    fs.writeFileSync(outputPath, JSON.stringify(combinedData, null, 2));
    console.log(`[✓] ${OUTPUT_FILE} saved with ${combinedData.length} records at ${outputPath}`);
  } catch (error: any) {
    console.error('[X] Error:', error.message || error);
  }
}

main();
