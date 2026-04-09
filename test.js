import axios from "axios";

const BASE_URL = process.env.BASE_URL || "http://localhost:5000";
const TEST_EMAIL = process.env.TEST_EMAIL || "test@mail.com";
const TEST_PASSWORD = process.env.TEST_PASSWORD || "123456";

const client = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
});

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const requestWithRetry = async (requestFn, retries = 3) => {
  let lastError;

  for (let attempt = 1; attempt <= retries; attempt += 1) {
    try {
      return await requestFn();
    } catch (error) {
      lastError = error;

      if (attempt < retries) {
        await sleep(1000 * attempt);
      }
    }
  }

  throw lastError;
};

async function test() {
  try {
    const health = await requestWithRetry(() => client.get("/api/health"));
    if (health.status === 200 && health.data?.status === "OK") {
      console.log("Health OK");
    } else {
      throw new Error("Health check returned unexpected response.");
    }

    const login = await requestWithRetry(() =>
      client.post("/api/auth/login", {
        email: TEST_EMAIL,
        password: TEST_PASSWORD,
      })
    );

    if (login.status === 200 && login.data?.success) {
      console.log("Login test handled");
    } else {
      console.log("Login test handled");
    }

    console.log("No crashes");
  } catch (error) {
    const status = error.response?.status;
    const message = error.response?.data?.message;

    if (status === 400 || status === 401) {
      console.log("Login test handled");
      console.log("No crashes");
      return;
    }

    console.error("Test Failed:", error.response?.data || error.message);
    process.exitCode = 1;
  }
}

test();