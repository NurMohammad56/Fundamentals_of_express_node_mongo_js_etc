import http from "http";
import path from "path";

async function testRequest() {
  console.log("Starting Express Test....");

  const baseURL = "http://localhost:3000";

  const tests = [
    {
      name: "1. Normal Request",
      method: "GET",
      path: "/api/users",
      expected: 200,
    },
    {
      name: "2. 404 Not Found",
      method: "GET",
      path: "/non-existent",
      expected: 404,
    },
    {
      name: "3. Async Error",
      method: "GET",
      path: "/api/async-error",
      expected: 500,
    },
    {
      name: "4. Validation Error",
      method: "POST",
      path: "/api/users",
      data: { name: "John" }, // Missing email
      expected: 400,
    },
    {
      name: "5. Cookie Test",
      method: "GET",
      path: "/api/cookie-test",
      expected: 200,
    },
    {
      name: "6. Session Test",
      method: "GET",
      path: "/api/session-test",
      expected: 200,
    },
  ];

  for (const test of tests) {
    await runTest(baseURL, test);
  }
}

function runTest(baseURL, test) {
  return new Promise((resolve) => {
    const option = {
      hostname: "localhost",
      port: 3000,
      path: test.path,
      method: test.method,
      headers: {},
    };

    if (test.data) {
      option.headers;
    }

    const req = http.request(option, (res) => {
      let data = "";
      res.on("data", (chunk) => {
        data += chunk;
      });
      res.on("end", () => {
        const statusMatch = res.statusCode === test.expected;
        console.log(
          `${test.name}: Expected ${test.expected}, Got ${res.statusCode} - ${statusMatch ? "PASS" : "FAIL"}`,
        );

        if (data) {
          try {
            const json = JSON.parse(data);
            console.log(
              `   Response: ${JSON.stringify(json).substring(0, 100)}...`,
            );
          } catch (error) {
            console.log("   Response: (Not JSON)");
          }
        }
        console.log();
        resolve();
      });
    });
    req.on("error", (error) => {
      console.error(`${test.name}: Request Error - ${error.message}`);
      resolve();
    });

    if (test.data) {
      req.write(JSON.stringify(test.data));
    }
    req.end();
  });
}

testRequest();

