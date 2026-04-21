import { getCached, setCached } from "./cache";
import { summarize } from "./claude";
import { getContributions } from "./github";
import { confirm } from "./prompt";
import { spinner } from "./spinner";
import { transform } from "./transform";

const date = Bun.argv[2];
if (!date) {
        console.error("Usage: worklog <YYYY-MM-DD>");
        process.exit(1);
}
if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || isNaN(new Date(date).getTime())) {
        console.error(`Invalid date: ${date}. Expected YYYY-MM-DD.`);
        process.exit(1);
}

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
if (!GITHUB_TOKEN) {
        console.error("GITHUB_TOKEN env var is required. Try: GITHUB_TOKEN=$(gh auth token) worklog <date>");
        process.exit(1);
}

const cached = getCached(date);
if (cached) {
        console.log(cached);
        const interactive = process.stdin.isTTY && process.stdout.isTTY;
        if (!interactive || !(await confirm("Regenerate? [y/N] "))) {
                process.exit(0);
        }
}

const ghSpinner = spinner("Fetching GitHub activity...");
let rawData;
try {
        rawData = await getContributions(GITHUB_TOKEN, date);
} finally {
        ghSpinner.stop();
}

const transformedData = transform(rawData);

if (Object.keys(transformedData).length === 0) {
        console.log(`No data for ${date}, nothing to summarize`);
        process.exit(0);
}

const input = { date, summaryInput: transformedData };

const claudeSpinner = spinner("Summarizing with Claude...");
let report;
try {
        report = await summarize(JSON.stringify(input));
} finally {
        claudeSpinner.stop();
}

setCached(date, report);
console.log(report);
