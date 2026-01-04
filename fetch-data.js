const fs = require('fs');

// Configuration
const API_BASE = "https://api.votehub.com/polls";
const LOOKBACK_DAYS = 400;

// Helper to build the URL
const getUrl = (type, extra = {}) => {
  const date = new Date();
  date.setDate(date.getDate() - LOOKBACK_DAYS);
  const fromDate = date.toISOString().split('T')[0];
  
  const params = new URLSearchParams({
    poll_type: type,
    from_date: fromDate,
    sort: "-end_date",
    ...extra
  });
  return `${API_BASE}?${params.toString()}`;
};

// Helper to extract the list from the API response
const extractList = (json) => {
  if (Array.isArray(json)) return json;
  if (json.polls && Array.isArray(json.polls)) return json.polls;
  return [];
};

async function run() {
  const data = {
    updatedAt: new Date().toISOString(),
    approval: [],
    genericBallot: []
  };

  try {
    // 1. Fetch Generic Ballot
    console.log("Fetching Generic Ballot...");
    const gbRes = await fetch(getUrl('generic-ballot'));
    if (gbRes.ok) {
      const json = await gbRes.json();
      data.genericBallot = extractList(json);
      console.log(`Generic Ballot: Found ${data.genericBallot.length} polls.`);
    }

    // 2. Fetch Approval (Try multiple subjects until we find data)
    // The previous script might have failed if 'donald-trump' returned 0 results.
    const subjects = ['donald-trump', 'trump', 'joe-biden', 'biden'];
    
    for (const slug of subjects) {
      console.log(`Attempting approval fetch for: ${slug}`);
      const appRes = await fetch(getUrl('approval', { subject: slug }));
      
      if (appRes.ok) {
        const json = await appRes.json();
        const list = extractList(json);
        
        if (list.length > 0) {
          data.approval = list;
          console.log(`Success! Found ${list.length} polls for ${slug}`);
          break; // Stop looking, we found data
        }
      }
    }

    if (data.approval.length === 0) {
      console.warn("WARNING: No approval polls found for any subject.");
    }

    // 3. Save to file
    fs.writeFileSync('polls.json', JSON.stringify(data, null, 2));
    console.log("Done. Data saved to polls.json");

  } catch (error) {
    console.error("Critical Error:", error);
    process.exit(1);
  }
}

run();
