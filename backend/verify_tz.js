const fetch = require("node-fetch");

const BASE_URL = "http://localhost:5000/api";

async function verifyTimezone(tzName) {
  console.log(`\n--- Testing Timezone: ${tzName} ---`);
  try {
    const timestamp = Date.now();
    const email = `tz_${tzName.replace(/\//g, "_")}_${timestamp}@test.com`;
    const password = "password123";

    // 1. Signup with timezone
    const signupRes = await fetch(`${BASE_URL}/auth/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, timezone: tzName }),
    });
    const { token } = await signupRes.json();
    console.log(`   Signed up as ${email}`);

    // 2. Create Subject
    const subRes = await fetch(`${BASE_URL}/subjects`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: "TZ Test",
        chapters: [{ name: "C1", topics: [{ name: "T1" }] }],
      }),
    });
    const subject = await subRes.json();

    // 3. Mark finished
    subject.chapters[0].topics[0].finished = true;
    await fetch(`${BASE_URL}/subjects/${subject._id}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(subject),
    });

    // 4. Get Stats
    const statsRes = await fetch(`${BASE_URL}/subjects/stats`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const stats = await statsRes.json();
    if (!statsRes.ok) {
      console.error(
        `   FAILURE: Stats request failed (${statsRes.status}):`,
        stats.message || stats,
      );
      return;
    }

    // Determine expected local date
    const formatToLocalDate = (date, timezone) => {
      const parts = new Intl.DateTimeFormat("en-CA", {
        timeZone: timezone,
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      }).formatToParts(date);
      const y = parts.find((p) => p.type === "year").value;
      const m = parts.find((p) => p.type === "month").value;
      const d = parts.find((p) => p.type === "day").value;
      return `${y}-${m}-${d}`;
    };

    const localDateStr = formatToLocalDate(new Date(), tzName);

    console.log(`   Expected Local Date: ${localDateStr}`);
    console.log(
      `   Activity Data:`,
      JSON.stringify(stats.activityData.filter((d) => d.count > 0)),
    );

    const todayEntry = stats.activityData.find((d) => d.date === localDateStr);
    if (todayEntry && todayEntry.count === 1) {
      console.log(
        `   SUCCESS: Activity recorded for ${tzName} today (${localDateStr})`,
      );
    } else {
      console.error(
        `   FAILURE: Expected count 1 for ${localDateStr}, but got:`,
        todayEntry,
      );
    }

    if (stats.finishedToday === 1) {
      console.log(`   SUCCESS: finishedToday is 1`);
    } else {
      console.error(`   FAILURE: finishedToday is ${stats.finishedToday}`);
    }
  } catch (err) {
    console.error(`   Error testing ${tzName}:`, err.message);
  }
}

async function runAll() {
  // Current UTC time: approx 00:15 Feb 9
  // NYC is -5h -> Feb 8 evening
  // Auckland is +13h -> Feb 9 afternoon
  await verifyTimezone("America/New_York");
  await verifyTimezone("Pacific/Auckland");
  await verifyTimezone("UTC");
}

runAll();
