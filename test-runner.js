const PORT = process.env.PORT || 3000;
const BASE_URL = process.env.BASE_URL || `http://localhost:${PORT}`;

const testCases = [
  "I am so happy and having a fantastic day!",
  "I will kill you and destroy everything you love. Watch your back!",
  "This product sucks. I wasted my money. It's absolute garbage and I hate it.",
  "You piece of worthless trash, go to hell!",
  "Wow, what an incredible and breathtaking surprise!",
  "I feel so lonely and abandoned. Nobody cares.",
  "I will murder anyone who steps in my way, you hear me?",
  "I LOVE THIS PRODUCT! WOW!",
  "I am just killing time waiting for the bus.",
  "This chocolate cake is absolutely to die for!",
];

async function runTests() {
  const sentimentUrl = `${BASE_URL}/api/sentiment`;

  try {
    const check = await fetch(sentimentUrl);
    if (!check.ok) {
      throw new Error(`Server returned HTTP ${check.status}`);
    }
  } catch (e) {
    console.error(`\n❌ Server is NOT running or unreachable at ${sentimentUrl}`);
    console.error(`Please start the server first (e.g. \`bun run dev\` or \`npm run dev\`), or set PORT/BASE_URL env var.`);
    console.error(`Error details: ${e.message}\n`);
    process.exit(1);
  }

  console.log(`\n🚀 Connected to server at ${BASE_URL}. Running ${testCases.length} test cases...\n`);

  let failureCount = 0;

  for (let i = 0; i < testCases.length; i++) {
    const text = testCases[i];
    try {
      const resp = await fetch(sentimentUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, analysisType: "all" }),
      });

      if (!resp.ok) {
        throw new Error(`HTTP ${resp.status}: ${await resp.text()}`);
      }

      const data = await resp.json();
      console.log(`--------------------------------------------------`);
      console.log(`[Test ${i + 1}/${testCases.length}]`);
      console.log(`TEXT:      "${text}"`);
      console.log(`SENTIMENT: ${data.results?.sentiment?.label} (Conf: ${data.results?.sentiment?.confidence})`);
      console.log(`EMOTION:   ${data.results?.emotion?.dominant}`);
      console.log(`TOXICITY:  ${data.results?.toxicity?.isToxic ? "YES" : "NO"} (Score: ${data.results?.toxicity?.score}, Flags: ${(data.results?.toxicity?.flags || []).join(", ")})`);
    } catch (e) {
      failureCount++;
      console.error(`❌ Test ${i + 1} failed:`, e.message);
    }
  }

  console.log(`--------------------------------------------------\n`);
  if (failureCount === 0) {
    console.log(`✅ All ${testCases.length} tests passed successfully!`);
    process.exit(0);
  } else {
    console.error(`❌ Completed with ${failureCount} failure(s).`);
    process.exit(1);
  }
}

runTests();

