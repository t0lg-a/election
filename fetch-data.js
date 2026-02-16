// votehub_polls.js
const fs = require("fs");

const API_BASE = "https://api.votehub.com/polls";
const LOOKBACK_DAYS = 400;

function fromDateISO(daysBack) {
  const d = new Date();
  d.setDate(d.getDate() - daysBack);
  return d.toISOString().slice(0, 10);
}

// VoteHub docs mention %20 explicitly; URLSearchParams uses '+' for spaces.
// If their backend doesn't decode '+', this matters. This forces %20.
function buildQuery(paramsObj) {
  const qs = new URLSearchParams(paramsObj).toString();
  return qs.replace(/\+/g, "%20");
}

function getUrl(extra = {}) {
  const from_date = fromDateISO(LOOKBACK_DAYS);
  const params = {
    from_date,
    sort: "-end_date",
    ...extra,
  };
  return `${API_BASE}?${buildQuery(params)}`;
}

function extractList(json) {
  if (Array.isArray(json)) return json;
  if (json && Array.isArray(json.polls)) return json.polls;
  if (json && Array.isArray(json.results)) return json.results; // defensive
  if (json && Array.isArray(json.data)) return json.data;       // defensive
  return [];
}

async function fetchJson(url) {
  const res = await fetch(url, {
    headers: {
      Accept: "application/json",
      "User-Agent": "votehub-polls-script/1.0",
    },
  });

  const text = await res.text();
  if (!res.ok) {
    throw new Error(
      `HTTP ${res.status} ${res.statusText}\nURL: ${url}\nBody (first 1200):\n${text.slice(0, 1200)}`
    );
  }

  // Some failures return HTML with 200; catch that too.
  try {
    return JSON.parse(text);
  } catch {
    throw new Error(
      `Non-JSON response\nURL: ${url}\nBody (first 1200):\n${text.slice(0, 1200)}`
    );
  }
}

async function run() {
  const data = {
    updatedAt: new Date().toISOString(),
    approval: [],
    genericBallot: [],
    debug: {
      approval_total_returned: 0,
      approval_subjects_seen: [],
      approval_filtered_subject: "Donald Trump",
    },
  };

  try {
    // 1) Generic Ballot
    console.log("Fetching Generic Ballot...");
    {
      const url = getUrl({ poll_type: "generic-ballot" });
      const json = await fetchJson(url);
      data.genericBallot = extractList(json);
      console.log(`Generic Ballot: Found ${data.genericBallot.length} polls.`);
    }

    // 2) Approval (fetch ALL approval polls, filter locally by subject)
    console.log("Fetching Approval (all approval polls, then filter to Donald Trump)...");
    {
      const url = getUrl({ poll_type: "approval" }); // <-- NO subject param
      const json = await fetchJson(url);
      const list = extractList(json);

      data.debug.approval_total_returned = list.length;

      const subjects = Array.from(new Set(list.map(p => p && p.subject).filter(Boolean)));
      data.debug.approval_subjects_seen = subjects.slice(0, 50);

      data.approval = list.filter(p => p && p.subject === "Donald Trump");

      console.log(`Approval (all subjects): ${list.length}`);
      console.log(`Approval (Donald Trump): ${data.approval.length}`);
    }

    if (data.approval.length === 0) {
      console.warn("WARNING: approval is still empty after local filtering.");
      console.warn("Check data.debug.approval_subjects_seen in polls.json to see what subjects are present.");
    }

    fs.writeFileSync("polls.json", JSON.stringify(data, null, 2));
    console.log("Done. Data saved to polls.json");
  } catch (err) {
    console.error("Critical Error:\n" + String(err));
    process.exit(1);
  }
}

run();
