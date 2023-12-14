import * as dotenv from "dotenv";
import * as fs from "fs";
import axios from "axios";
import qs from "qs";
import { Command } from "commander";

dotenv.config();

const config = {
  protocol: process.env.PROTOCOL,
  host: process.env.HOST,
  port: process.env.PORT,
  accountsPath: process.env.ACCOUNTS_PATH,
  poolTokenPath: process.env.POOL_TOKEN_PATH,
  apiPrefix: process.env.PROXY_API_PREFIX,
};

const PANDORA_BASE_URL = `${config.protocol}://${config.host}:${config.port}/${config.apiPrefix}`;

console.log(config);

const program = new Command();
program.version("0.1").option("-f, --force", "Force refresh tokens");
program.parse(process.argv);

let queue: { accountKey: string; accounts: Accounts; forceRefresh: boolean }[] =
  [];
const maxCallsPerMinute = 5;
let intervalId: NodeJS.Timeout | undefined;

interface AccountInfo {
  token: string;
  username: string;
  userPassword: string;
  updateTime: string;
}

interface Accounts {
  [key: string]: AccountInfo;
}

const checkAndRefreshToken = async (
  accounts: Accounts,
  accountKey: string,
  forceRefresh = false
) => {
  console.log("Checking and refreshing token for", accountKey);
  const account = accounts[accountKey];
  if (forceRefresh || isTokenExpiring(account.updateTime)) {
    console.log(`${accountKey} has expired. Refreshing...`);
    try {
      const newAccessToken = await getAccessToken(
        account.username,
        account.userPassword
      );
      const newShareToken = await getShareToken(accountKey, newAccessToken);

      account.token = newShareToken;
      account.updateTime = new Date().toISOString();

      fs.writeFileSync(config.accountsPath!, JSON.stringify(accounts, null, 2));
      console.log(`Updated token for ${accountKey}`);

      addNewShareToken(newShareToken);
    } catch (error) {
      console.error(`Error updating token for ${accountKey}:`, error);
    }
  } else {
    console.log(`${accountKey} is still valid. Skipping...`);
  }
};

// 函数获取 access_token
async function getAccessToken(
  username: string,
  password: string
): Promise<string> {
  const data = qs.stringify({
    username: username,
    password: password,
  });

  const config = {
    method: "post",
    url: `${PANDORA_BASE_URL}/api/auth/login`,
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    data: data,
  };

  try {
    const response = await axios.request(config);
    return response.data.access_token;
  } catch (error) {
    console.error("Error getting access token:", error);
    throw error;
  }
}

// 函数获取 share_token
async function getShareToken(
  uniqueName: string,
  accessToken: string
): Promise<string> {
  const data = qs.stringify({
    unique_name: uniqueName,
    access_token: accessToken,
    expires_in: "0",
    show_conversations: "true",
    show_userinfo: "false",
  });

  const config = {
    method: "post",
    url: `${PANDORA_BASE_URL}/api/token/register`,
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    data: data,
  };

  try {
    const response = await axios.request(config);
    return response.data.token_key;
  } catch (error) {
    console.error("Error getting share token:", error);
    throw error;
  }
}

function isTokenExpiring(
  updateTime: string,
  hoursUntilExpire: number = 12
): boolean {
  const lastUpdate = new Date(updateTime);
  const expireTime = new Date(lastUpdate.getTime() + 10 * 24 * 60 * 60 * 1000); // 10 days in milliseconds
  const currentTime = new Date();
  const hoursLeft =
    (expireTime.getTime() - currentTime.getTime()) / (1000 * 60 * 60); // Convert milliseconds to hours
  return hoursLeft < hoursUntilExpire;
}

function readPoolToken(): string | null {
  try {
    if (!config.poolTokenPath) {
      console.error("PoolTokenPath is not defined in env.");
      process.exit(1);
    }
    if (fs.existsSync(config.poolTokenPath)) {
      const poolToken = fs.readFileSync(config.poolTokenPath, "utf8").trim();
      const isValidToken = /^pk-[0-9a-zA-Z_\-]{43}$/.test(poolToken);
      return isValidToken ? poolToken : null;
    }
  } catch (error) {
    console.error("Error reading PoolToken.txt:", error);
  }
  return null;
}

async function updatePoolToken(
  shareTokens: string[],
  existingPoolToken?: string | null
): Promise<string> {
  const data = qs.stringify({
    share_tokens: shareTokens.join("\n"),
    pool_token: existingPoolToken || "",
  });

  const config = {
    method: "post",
    url: `${PANDORA_BASE_URL}/api/pool/update`,
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    data: data,
  };

  try {
    const response = await axios.request(config);
    return response.data.pool_token;
  } catch (error) {
    console.error("Error updating pool token:", error);
    throw error;
  }
}

const PTU_DURATION = 70000;
let shareTokens: string[] = [];
type Timer = NodeJS.Timeout | null;
let timer: Timer = null;
function addNewShareToken(newShareToken: string): void {
  shareTokens.push(newShareToken);

  // Clear existing timer if any
  if (timer) {
    clearTimeout(timer);
  }

  // Schedule garbage collection
  timer = setTimeout(addShareTokenToPool, PTU_DURATION);
}

async function addShareTokenToPool(): Promise<void> {
  try {
    const poolToken = readPoolToken();
    const updatedPoolToken = await updatePoolToken(shareTokens, poolToken);
    shareTokens = [];
    console.log(`Updated pool token: ${updatedPoolToken}`);
    if (!poolToken) {
      fs.writeFileSync(config.poolTokenPath!, updatedPoolToken);
    }
  } catch (error) {
    console.error("Error add ShareToken to pool:", error);
  }
}

function processQueue() {
  if (!queue.length) {
    clearInterval(intervalId);
    intervalId = undefined;
    return;
  }

  const tasks = queue.splice(0, maxCallsPerMinute);
  tasks.forEach(async (task) => {
    const { accountKey, accounts, forceRefresh } = task;
    await checkAndRefreshToken(accounts, accountKey, forceRefresh);
  });
}

if (!config.accountsPath) {
  console.error("AccountsPath is not defined in env.");
  process.exit(1);
}

const mainProcess = () => {
  try {
    const rawData = fs.readFileSync(config.accountsPath!, "utf8");
    const accounts: Accounts = JSON.parse(rawData);

    console.log(accounts);

    console.log("Check pool token");
    const poolToken = readPoolToken();

    let forceRefresh = false;
    if (!poolToken || program.opts().force) {
      forceRefresh = true;
    }
    Object.keys(accounts).forEach((accountKey) => {
      queue.push({ accountKey, accounts, forceRefresh });
    });
    if (!intervalId) {
      intervalId = setInterval(processQueue, 60000 / maxCallsPerMinute);
    }
  } catch (error) {
    console.error("Error reading or parsing the token file:", error);
  }
};

// 定时检查
setInterval(mainProcess, 6 * 60 * 60 * 1000); // 每 6 小时检查一次

// 立即启动第一轮处理
mainProcess();
