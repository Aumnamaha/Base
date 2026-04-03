const testCases = [
  "I am so happy and having a fantastic day!",
  "I will kill you and destroy everything you love. Watch your back!",
  "This product sucks. I wasted my money. It's absolute garbage and I hate it.",
  "You piece of worthless trash, go to hell!",
  "Wow, what an incredible and breathtaking surprise!",
  "I feel so lonely and abandoned. Nobody cares.",
  "I will murder anyone who steps in my way, you hear me?",
];

async function runTests() {
  let serverRunning = false;
  try {
    const check = await fetch("http://localhost:3050/api/sentiment");
    serverRunning = true;
  } catch(e) {
    console.error("Server is NOT running on http://localhost:3050\nPlease start the server (e.g. `bun dev`) before running tests.");
    process.exit(1);
  }

  for (const text of testCases) {
    try {
      const resp = await fetch("http://localhost:3050/api/sentiment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, analysisType: "all" })
      });
      const data = await resp.json();
      console.log("--------------------------------------------------");
      console.log(`TEXT: "${text}"`);
      console.log(`SENTIMENT: ${data.results.sentiment.label} (Conf: ${data.results.sentiment.confidence})`);
      console.log(`EMOTION: ${data.results.emotion.dominant}`);
      console.log(`TOXICITY: ${data.results.toxicity.isToxic ? 'YES' : 'NO'} (Score: ${data.results.toxicity.score}, Flags: ${data.results.toxicity.flags.join(", ")})`);
    } catch(e) {
      console.error("Test failed: ", e);
    }
  }
}

runTests();
