// votehub_polls.js
// Node 18+ (global fetch). If you're on Node <18, install node-fetch and adapt.

const fs = require("fs");

const API_BASE = "https://api.votehub.com";
const LOOKBACK_DAYS = 400;

const headers = {
  "Accept": "application/json",
  "User-Agent": "votehub-polls-script/1.0"
};

function fromDateISO(daysBack) {
  const d = new Date();
  d.setDate(d.getDate() - daysBack);
  return d.toISOString().slice(0, 10);
}

function buildUrl(path, paramsObj = {}) {
  const params = new URLSearchParams(paramsObj);
  return `${API_BASE}${path}?${params.toString()}`;
}

function extractList(json) {
  if (Array.isArray(json)) return json;
  if (json && Array.isArray(json.polls)) return json.polls;
  if (json && Array.isArray(json.results)) return json.results;
  if (json && Array.isArray(json.data)) return json.data;
  return [];
}

async function fetchJson(url) {
  const res = await fetch(url, { headers });

  const ct = (res.headers.get("content-type") || "").toLowerCase();
  const bodyText = await res.text();

  if (!res.ok) {
    throw new Error(
      `HTTP ${res.status} ${res.statusText}\nURL: ${url}\nBody (first 1200 chars):\n${bodyText.slice(0, 1200)}`
    );
  }

  if (!ct.includes("application/json")) {
    throw new Error(
      `Expected JSON but got content-type="${ct}"\nURL: ${url}\nBody (first 1200 chars):\n${bodyText.slice(0, 1200)}`
    );
  }

  return JSON.parse(bodyText);
}

async function run() {
  const from_date = fromDateISO(LOOKBACK_DAYS);

  const data = {
    updatedAt: new Date().toISOString(),
    approval: [],
    genericBallot: [],
    debug: {
      chosenApprovalSubject: null,
      attemptedApprovalSubjects: []
    }
  };

  // 1) Generic ballot
  console.log("Fetching Generic Ballot...");
  {
    const url = buildUrl("/polls", {
      poll_type: "generic-ballot",
      from_date,
      sort: "-end_date"
    });

    const json = await fetchJson(url);
    data.genericBallot = extractList(json);
    console.log(`Generic Ballot: Found ${data.genericBallot.length} polls.`);
  }

  // 2) Get canonical approval-capable subjects
  console.log("Fetching subject catalog...");
  let approvalSubjects = [];
  try {
    const subjectsUrl = `${API_BASE}/subjects`;
    const subjectsJson = await fetchJson(subjectsUrl);

    // /subjects is typically an array of { subject, poll_types }
    if (Array.isArray(subjectsJson)) {
      approvalSubjects = subjectsJson
        .filter(s => Array.isArray(s.poll_types) && s.poll_types.includes("approval"))
        .map(s => s.subject)
        .filter(Boolean);
    }
  } catch (e) {
    console.warn("WARNING: /subjects fetch failed; falling back to manual subject guesses.");
    console.warn(String(e).slice(0, 300) + "...");
  }

  // Prefer Trump if present; else use first approval subject; else null
  const trumpCanonical =
    approvalSubjects.find(s => String(s).toLowerCase() === "donald trump") || null;

  const chosenSubject = trumpCanonical || approvalSubjects[0] || null;
  data.debug.chosenApprovalSubject = chosenSubject;

  // 3) Approval polls (try canonical first, then fallbacks)
  console.log("Fetching Approval...");
  const approvalCandidates = [
    chosenSubject,     // canonical, best case
    "Donald Trump",
    "donald-trump",
    "Trump",
    "Joe Biden",
    "joe-biden",
    "Biden"
  ].filter(Boolean);

  let lastErr = null;

  for (const subject of approvalCandidates) {
    data.debug.attemptedApprovalSubjects.push(subject);
    console.log(`Attempting approval fetch for subject="${subject}"`);

    try {
      const url = buildUrl("/polls", {
        poll_type: "approval",
        subject,
        from_date,
        sort: "-end_date"
      });

      const json = await fetchJson(url);
      const list = extractList(json);
      console.log(`  -> got ${list.length}`);

      if (list.length > 0) {
        data.approval = list;
        console.log(`Success: Found ${list.length} approval polls for "${subject}"`);
        break;
      }
    } catch (e) {
      lastErr = e;
      console.warn(`  -> failed: ${String(e).split("\n")[0]}`);
    }
  }

  if (!data.approval.length) {
    console.warn("WARNING: No approval polls found.");
    if (lastErr) {
      console.warn("Last error detail:\n" + String(lastErr));
    }
  }

  fs.writeFileSync("polls.json", JSON.stringify(data, null, 2));
  console.log("Done. Data saved to polls.json");
}

run().catch((e) => {
  console.error("Critical Error:\n" + String(e));
  process.exit(1);
});
