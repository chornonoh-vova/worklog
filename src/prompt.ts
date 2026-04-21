import { createInterface } from "node:readline/promises";

export async function confirm(question: string): Promise<boolean> {
        const rl = createInterface({ input: process.stdin, output: process.stderr });
        try {
                const answer = await rl.question(question);
                return answer.trim().toLowerCase().startsWith("y");
        } finally {
                rl.close();
        }
}
