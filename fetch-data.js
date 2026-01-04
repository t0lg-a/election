const fs = require('fs');

// This is the URL your HTML used to fetch
const API_URL = "https://api.votehub.com/polls?poll_type=generic-ballot&from_date=2024-01-01&sort=-end_date";

async function saveData() {
  // 1. Fetch the data
  const response = await fetch(API_URL);
  const data = await response.json();

  // 2. Add a timestamp so we know when it was updated
  const finalData = {
    updated_at: new Date().toISOString(),
    polls: data
  };

  // 3. Save it to a file named 'polls.json'
  fs.writeFileSync('polls.json', JSON.stringify(finalData, null, 2));
  console.log("Data saved to polls.json");
}

saveData();
