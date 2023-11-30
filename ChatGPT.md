
# Talk to GPT-4


***User***

你是一名熟练掌握 TypeScript 的程序员，下面你需要协助我从零开始使用 TypeScript 一步一步完成一个工具程序的代码编写任务。我主要负责程序逻辑的设计，你主要负责程序逻辑的代码实现。
该程序用来实现定期更新 Pandora（一个接口服务器）所需的 share_token. 我对程序的主要逻辑设计是这样的：
Step 1 - 程序启动时通过使用 dotenv 库读取基础配置文件。配置文件中包含访问 Pandora 服务器的 Protocol, Host, Port，以及 TokenPath(该路径文件存储需要获取 share_token 的账号信息的配置)
Step 2 - 读取 TokenPath 所指向的文件的内容，该文件是一个 JSON 格式的文件，里面包含了多个账号的用户名与密码以及对应用户的 share_token 的更新时间
Step 3 - 对上面每个账号设定一个独立的计时器，每隔一段时间就检测对应账号的 share_token 是否快要过期。如果是，则调用 Pandora 的授权接口重新获取 share_token，并更新 TokenPath 所指向的文件的该账号的 share_token 的更新时间
以上就是该程序的主要逻辑。
接下来我们来完成每一步逻辑的实现代码，并完善相关细节。
首先请你实现 Step 1 的代码。


***Assistant***

好的，我们来一步一步实现这个 TypeScript 程序。首先，我们需要处理 Step 1：通过 dotenv 库来读取配置文件。这需要我们做以下几件事情：

1. **初始化项目**：创建一个新的 Node.js 项目，并安装 TypeScript 和 dotenv。
2. **创建 TypeScript 配置文件**：配置 TypeScript 以适应我们的项目。
3. **安装 dotenv 库**：使用 npm 或 yarn 来安装 dotenv。
4. **创建并读取配置文件**：创建一个 `.env` 文件并用 dotenv 读取其中的变量。

### Step 1: 实现代码

1. **初始化项目**：
    - 创建一个新的目录。
    - 在该目录中运行 `npm init -y` 以初始化一个新的 Node.js 项目。
    - 运行 `npm install typescript --save-dev` 安装 TypeScript。
    - 运行 `tsc --init` 创建一个默认的 `tsconfig.json` 文件。

2. **安装 dotenv**：
    - 运行 `npm install dotenv` 安装 dotenv。

3. **创建 .env 文件**：
    - 在项目根目录中创建一个 `.env` 文件。
    - 添加如下内容（根据你的需求进行调整）：
      ```
      PROTOCOL=http
      HOST=localhost
      PORT=8080
      TOKEN_PATH=./token.json
      ```

4. **创建 TypeScript 文件来读取 .env 文件**：
    - 创建一个 `index.ts` 文件。
    - 在 `index.ts` 中，写入以下代码来读取 .env 文件中的变量：
      ```typescript
      import * as dotenv from 'dotenv';

      dotenv.config();

      const config = {
        protocol: process.env.PROTOCOL,
        host: process.env.HOST,
        port: process.env.PORT,
        tokenPath: process.env.TOKEN_PATH
      };

      console.log(config);
      ```

5. **编译并运行 TypeScript 程序**：
    - 在 `package.json` 中添加一个脚本来编译 TypeScript 代码：`"build": "tsc"`.
    - 运行 `npm run build` 来编译 TypeScript 代码。
    - 运行编译后的 JavaScript 代码，比如 `node dist/index.js`（假设 `dist` 是 TypeScript 编译输出目录）。

这样我们就完成了 Step 1 的实现。接下来，如果你准备好了，我们可以继续实现 Step 2。


***User***

好的。TokenPath 指向的文件内容示例如下：

```json
{
    "ChatGPT2" : {
      "token" : "eyJhbGc",
      "username" : "004",
      "userPassword" : "1bnj",
      "updateTime" : "2023-11-21 07:41:30"
    },
    "ChatGPT3" : {
      "token" : "eyJhbGc",
      "username" : "005",
      "userPassword" : "2bnj",
      "updateTime" : "2023-11-21 07:41:31"
    },
    "ChatGPT4" : {
      "token" : "eyJhbGc",
      "username" : "006",
      "userPassword" : "3bnj",
      "updateTime" : "2023-11-21 07:41:32"
    }
}
```

这个示例文件里保存了名为 ChatGPT2,ChatGPT3,ChatGPT4 这 3 不同账号的信息，包括他们各自的用户名（username）与密码（userPassword）以及 token 最后更新时间（updateTime）。


***Assistant***

明白了。现在我们进入 Step 2 的实现，即读取 `TokenPath` 所指向的 JSON 文件，并解析里面的账户信息。为此，我们需要执行以下步骤：

1. **读取并解析 JSON 文件**：使用 Node.js 的 `fs` 模块读取 JSON 文件，并将其内容解析为 JavaScript 对象。
2. **处理数据结构**：确保我们能够方便地访问每个账户的信息。

### Step 2: 实现代码

1. **修改 `index.ts`**：
    - 首先，需要在项目中安装 `@types/node` 以便能够在 TypeScript 中顺利使用 Node.js 的模块。运行 `npm install @types/node --save-dev`。
    - 接下来，修改 `index.ts` 以包括读取和解析 JSON 文件的代码。

2. **编写读取 JSON 文件的代码**：
    - 在 `index.ts` 文件中，添加以下代码：
      ```typescript
      import * as fs from 'fs';

      interface AccountInfo {
        token: string;
        username: string;
        userPassword: string;
        updateTime: string;
      }

      interface Accounts {
        [key: string]: AccountInfo;
      }

      try {
        const rawData = fs.readFileSync(config.tokenPath, 'utf8');
        const accounts: Accounts = JSON.parse(rawData);

        console.log(accounts);
      } catch (error) {
        console.error('Error reading or parsing the token file:', error);
      }
      ```

    - 这段代码首先定义了两个接口，`AccountInfo` 和 `Accounts`，用来描述 JSON 文件中的数据结构。
    - 然后，使用 `fs.readFileSync` 方法读取 `TokenPath` 所指向的文件。
    - 使用 `JSON.parse` 将读取到的字符串解析为 JavaScript 对象。
    - 如果过程中发生错误，捕获这些错误并打印出来。

3. **编译并测试程序**：
    - 再次运行 `npm run build` 来编译 TypeScript 代码。
    - 运行编译后的 JavaScript 代码进行测试。

这样我们就实现了 Step 2，成功读取并解析了 JSON 文件。下一步是 Step 3，即为每个账户设置计时器，并在 token 快要过期时更新它们。如果你准备好了，我们可以开始 Step 3 的实现。


***User***

好的。在 Step 3 中，我们需要调用 Pandora 的相关接口来获取 share_token. 获取 share_token 需要通过 2 步来实现：

1. 获取 access_token：通过调用 /api/auth/login 接口获取。该接口的接口文档如下：

/auth/login
HTTP 方法：POST
请求类型：application/x-www-form-urlencoded
请求字段：
username：账号
password：密码
返回字段：返回 Access Token 和 Session Token 等信息
频率控制：根据 IP 地址 6/1m 限制，被限制时返回 429 错误码

```sh
curl --location '/auth/login' \
--header 'Content-Type: application/x-www-form-urlencoded' \
--data-urlencode 'username=<username>' \
--data-urlencode 'password=<userPassword>'
```

Response 示例：

```json
{
  "access_token": "eyJ",
  "expires_in": 864000,
  "session_token": "eyJ",
  "token_type": "Bearer"
}
```

2. 获取 share_token：通过调用 /api/token/register 接口获取。该接口的接口文档如下：
接口描述：注册或更新 Share Token
HTTP 方法：POST
请求类型：application/x-www-form-urlencoded
请求字段：
unique_name：一个唯一的名字，这里要注意相同 unique_name 和 access_token 始终生成相同的 Share Token
access_token：账号的 Access Token
site_limit：限制 Share Token 使用的站点，格式为：https://xxx.yyy.com，可留空不作限制
expires_in：Share Token 的有效期，单位为：秒，为 0 时表示与 Access Token 同效，为 -1 时吊销 Share Token
show_conversations：是否进行会话隔离，true 或 false，默认为 false
show_userinfo：是否隐藏 邮箱 等账号信息，true 或 false，默认为 false
返回字段：返回 Share Token 等信息

```sh
curl --location '/token/register' \
--header 'Content-Type: application/x-www-form-urlencoded' \
--data-urlencode 'unique_name=fakeopen' \
--data-urlencode 'access_token=<accesstoken>' \
--data-urlencode 'site_limit=https://chat.xf233.com' \
--data-urlencode 'expires_in=0' \
--data-urlencode 'show_conversations=true' \
--data-urlencode 'show_userinfo=false'
```

Response 示例：

```json
{
  "expire_at": 1202125231,
  "show_conversations": true,
  "show_userinfo": false,
  "site_limit": "https://chat.xf233.com",
  "token_key": "fk-",
  "unique_name": "fakeopen"
}
```


***Assistant***

在 Step 3 中，我们的任务是通过调用 Pandora 的两个接口来获取 `access_token` 和 `share_token`。这涉及到以下几个步骤：

1. **创建 HTTP 请求功能**：我们需要发送 HTTP 请求到 Pandora 的接口。为此，我们可以使用 `axios` 库，它是一个基于 promise 的 HTTP 客户端。

2. **实现获取 access_token 的功能**：根据你提供的接口文档，编写代码来调用 `/api/auth/login` 接口并获取 `access_token`。

3. **实现获取 share_token 的功能**：同样根据你提供的接口文档，编写代码来调用 `/api/token/register` 接口并获取 `share_token`。

4. **更新 JSON 文件中的 token 和 updateTime**：在获取到新的 `share_token` 后，更新 JSON 文件中相应账户的 `share_token` 和 `updateTime`。

### Step 3: 实现代码

1. **安装 axios**：
    - 运行 `npm install axios` 安装 axios。

2. **修改 `index.ts`**：
    - 导入 axios，并编写获取 `access_token` 和 `share_token` 的函数。
    - 更新 JSON 文件的代码。

3. **编写获取 access_token 的代码**：
    ```typescript
    import axios from 'axios';

    // 函数获取 access_token
    async function getAccessToken(username: string, password: string): Promise<string> {
      try {
        const response = await axios.post('http://<PandoraHost>/auth/login', `username=${username}&password=${password}`, {
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        });
        return response.data.access_token;
      } catch (error) {
        console.error('Error getting access token:', error);
        throw error;
      }
    }
    ```

4. **编写获取 share_token 的代码**：
    ```typescript
    // 函数获取 share_token
    async function getShareToken(uniqueName: string, accessToken: string): Promise<string> {
      try {
        const response = await axios.post('http://<PandoraHost>/token/register', `unique_name=${uniqueName}&access_token=${accessToken}&site_limit=https://chat.xf233.com&expires_in=0&show_conversations=true&show_userinfo=false`, {
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        });
        return response.data.token_key;
      } catch (error) {
        console.error('Error getting share token:', error);
        throw error;
      }
    }
    ```

5. **更新 JSON 文件的代码**：
    - 完成上述两个函数后，我们可以在主逻辑中遍历账户，检查 token 是否需要更新，并相应地调用这两个函数。
    - 之后，更新 JSON 文件中的 `token` 和 `updateTime`。

6. **编译并测试程序**：
    - 再次运行 `npm run build` 编译 TypeScript 代码。
    - 运行编译后的 JavaScript 代码进行测试。

这样我们就实现了 Step 3 的功能。由于这涉及到实际的 HTTP 请求，你可能需要调整代码中的一些细节，比如 Pandora 服务器的地址和端口等。如果你有任何问题，或者需要进一步的帮助，随时告诉我。


***User***

请参考下面的代码改写你上面两个函数中 axios 的用法。

```javascript
const axios = require('axios');
const qs = require('qs');
let data = qs.stringify({
  'unique_name': 'fakeopen',
  'access_token': '<accesstoken>',
  'site_limit': 'https://chat.xf233.com',
  'expires_in': '0',
  'show_conversations': 'true',
  'show_userinfo': 'true' 
});

let config = {
  method: 'post',
  maxBodyLength: Infinity,
  url: 'https://ai.fakeopen.com/token/register',
  headers: { 
    'Content-Type': 'application/x-www-form-urlencoded'
  },
  data : data
};

axios.request(config)
.then((response) => {
  console.log(JSON.stringify(response.data));
})
.catch((error) => {
  console.log(error);
});
```


***Assistant***

根据你提供的样例代码，我们可以重写获取 `access_token` 和 `share_token` 的函数，以符合这种 `axios` 使用方式。主要变化是使用 `qs` 库来格式化请求数据，并且配置 `axios` 请求时使用对象格式。

### 改写后的函数实现：

1. **安装 qs 库**：
    - 运行 `npm install qs` 安装 qs 库。

2. **改写获取 access_token 的函数**：
    ```typescript
    import axios from 'axios';
    import qs from 'qs';

    // 函数获取 access_token
    async function getAccessToken(username: string, password: string): Promise<string> {
      const data = qs.stringify({
        'username': username,
        'password': password
      });

      const config = {
        method: 'post',
        url: 'http://<PandoraHost>/auth/login',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        data: data
      };

      try {
        const response = await axios.request(config);
        return response.data.access_token;
      } catch (error) {
        console.error('Error getting access token:', error);
        throw error;
      }
    }
    ```

3. **改写获取 share_token 的函数**：
    ```typescript
    // 函数获取 share_token
    async function getShareToken(uniqueName: string, accessToken: string): Promise<string> {
      const data = qs.stringify({
        'unique_name': uniqueName,
        'access_token': accessToken,
        'site_limit': 'https://chat.xf233.com',
        'expires_in': '0',
        'show_conversations': 'true',
        'show_userinfo': 'false'
      });

      const config = {
        method: 'post',
        url: 'http://<PandoraHost>/token/register',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        data: data
      };

      try {
        const response = await axios.request(config);
        return response.data.token_key;
      } catch (error) {
        console.error('Error getting share token:', error);
        throw error;
      }
    }
    ```

这两个函数现在使用 `qs.stringify` 来格式化请求数据，并通过一个配置对象来指定 `axios` 的请求参数。这样的写法更加清晰和灵活，也更容易适应不同的请求需求。

再次编译并测试程序，确保一切正常运行。如果遇到任何问题或需要进一步的帮助，请随时告诉我。


***User***

Step 3 中我提到需要对每个账号设定一个独立的计时器，每隔一段时间就检测对应账号的 share_token 是否快要过期。如果是，则调用 Pandora 的授权接口重新获取 share_token，并更新 TokenPath 所指向的文件的该账号的 share_token 的更新时间。
这部分的逻辑代码你没有实现。
另外，由于 access_token 与 share_token 的有效期都是 10 天，所以我们可以通过每个账号的 share_token 的最后一次更新时间得出对应的过期时间，然后需要每隔 6 个小时检测一次对应账号的 share_token 的过期时间与当前时间的间隔。若间隔小于 12 个小时，则需要对 token 进行更新。


***Assistant***

了解了，我们需要为每个账户设置一个计时器，定期检查其 `share_token` 是否接近过期，并在需要时更新它。这部分逻辑可以通过 Node.js 的 `setInterval` 函数实现，同时还需要比较当前时间和 `share_token` 的过期时间。我们将执行以下步骤：

1. **创建定时检查函数**：为每个账户创建一个定时器，每隔 6 小时检查 `share_token` 的过期状态。
2. **计算并比较过期时间**：根据账户的 `share_token` 更新时间和有效期，计算出过期时间，并与当前时间比较。
3. **在需要时更新 token**：如果发现 `share_token` 即将在 12 小时内过期，调用先前编写的函数来更新 `access_token` 和 `share_token`。
4. **更新 JSON 文件**：更新 `share_token` 和 `updateTime` 后，将新的信息写回 JSON 文件。

### Step 3: 实现定时检查和更新逻辑

1. **计算过期时间的辅助函数**：
    ```typescript
    function isTokenExpiring(updateTime: string, hoursUntilExpire: number = 12): boolean {
      const lastUpdate = new Date(updateTime);
      const expireTime = new Date(lastUpdate.getTime() + 10 * 24 * 60 * 60 * 1000); // 10 days in milliseconds
      const currentTime = new Date();
      const hoursLeft = (expireTime.getTime() - currentTime.getTime()) / (1000 * 60 * 60); // Convert milliseconds to hours
      return hoursLeft < hoursUntilExpire;
    }
    ```

2. **为每个账户设置定时器**：
    ```typescript
    Object.keys(accounts).forEach(async (accountKey) => {
      setInterval(async () => {
        const account = accounts[accountKey];
        if (isTokenExpiring(account.updateTime)) {
          try {
            const newAccessToken = await getAccessToken(account.username, account.userPassword);
            const newShareToken = await getShareToken(accountKey, newAccessToken);

            account.token = newShareToken;
            account.updateTime = new Date().toISOString();

            fs.writeFileSync(config.tokenPath, JSON.stringify(accounts, null, 2));
            console.log(`Updated token for ${accountKey}`);
          } catch (error) {
            console.error(`Error updating token for ${accountKey}:`, error);
          }
        }
      }, 6 * 60 * 60 * 1000); // Check every 6 hours
    });
    ```

3. **整合进主逻辑**：
    - 在 `index.ts` 中整合上述代码。
    - 确保所有函数和错误处理都已正确设置。

这样，我们就实现了定期检查和在必要时更新 `share_token` 的逻辑。每个账户都会有一个独立的定时器，定期检查其 token 的过期状态，并在接近过期时自动更新。

请再次编译并测试程序，确保功能正常工作。如有任何问题或需要进一步的帮助，请随时告诉我。


***User***

现在让我们为程序再增加一个功能：
检查是否存在 PoolToken.txt 这个文本文件，如果这个文件存在，读取其中的内容，此内容应为 pool_token 的值：
* 基本格式为：pk-[0-9a-zA-Z_\-]{43} ，长度为：46。
* 使用该功能可以将最多 100 个 share_token 组合在一起。

然后需要通过调用 /pool/update 接口来更新 pool_token，该接口的说明文档如下：

```
接口描述：注册或更新 pool_token，该接口的文档如下：
HTTP 方法：POST
请求类型：application/x-www-form-urlencoded
请求字段：
share_tokens：share_token 列表，每行 1 个，最多 100 个
pool_token：可留空，留空时生成新 pool_token 不为空则更新 pool_token
返回字段：返回 pool_token 等信息
频率控制：无
特别说明：share_tokens 为空，且 pool_token 不为空时，会吊销指定的 pool_token
```

每当程序对任意账号的 share_token 进行了更新时，都需要调用此接口，将所有账号最新的 share_token 更新到 pool_token 中。

而如果 PoolToken.txt 文件不存在或者这个文件中没有符合上面 pool_token 格式的内容，则同样需要调用 /pool/update 接口获取新的 pool_token，并将这个 pool_token 写入到 PoolToken.txt 文件中。


***Assistant***

