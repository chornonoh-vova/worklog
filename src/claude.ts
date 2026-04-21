export async function summarize(input: string): Promise<string> {
        const prompt = `You are generating a concise daily work report for a software engineer.

Content rules:
- Infer intent from PR titles; do not invent details
- Group by repository, in the order given in the input
- Merge similar items into one line
- Omit repositories with no activity

Output format (follow EXACTLY, plain text, no markdown, no bold, no headers):

<date>

<repository-name-exactly-as-given>
Authored:
- <one-line description>
- <one-line description>
Reviewed:
- <one-line description>

<next-repository-name>
Authored:
- <one-line description>

Rules for the format:
- Use the repository name verbatim from the input (do not re-case, do not prefix)
- Always use "- " (dash + space) for list items
- Omit the "Authored:" or "Reviewed:" sub-section if it has no items
- Separate repositories with a single blank line

Example output:

2026-04-15

worklog
Authored:
- Added spinner utility for CLI feedback
- Refactored GitHub layer to typed responses
Reviewed:
- Approved updates to the getting-started guide

axe-core
Reviewed:
- Approved color-contrast rule fix

Input:
${input}`;

        const proc = Bun.spawn(["claude", "--model", "haiku", "-p"], {
                stdin: "pipe",
                stdout: "pipe",
                stderr: "pipe",
        });

        proc.stdin.write(prompt);
        await proc.stdin.end();

        const [stdout, stderr, exitCode] = await Promise.all([
                new Response(proc.stdout).text(),
                new Response(proc.stderr).text(),
                proc.exited,
        ]);

        if (exitCode !== 0) {
                throw new Error(`claude CLI failed (exit ${exitCode}): ${stderr.trim() || "no stderr"}`);
        }

        return stdout.trim();
}
