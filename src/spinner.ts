const frames = ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"];

export function spinner(label: string) {
        const stream = process.stderr;

        if (!stream.isTTY) {
                return { stop: () => {} };
        }

        let i = 0;
        stream.write("\x1B[?25l");
        const interval = setInterval(() => {
                i = (i + 1) % frames.length;
                stream.write(`\r${frames[i]} ${label}`);
        }, 80);

        return {
                stop: () => {
                        clearInterval(interval);
                        stream.write("\r\x1B[K\x1B[?25h");
                },
        };
}
