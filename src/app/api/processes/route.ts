import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import util from 'util';

const execAsync = util.promisify(exec);

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        // Get top 50 processes by CPU usage
        const { stdout } = await execAsync('ps -e --format pid,pcpu,pmem,comm,args --sort=-pcpu | head -n 51'); // +1 for header
        const lines = stdout.trim().split('\n');

        // Skip header
        const processes = lines.slice(1).map(line => {
            const parts = line.trim().split(/\s+/);
            // pid is 0, pcpu 1, pmem 2, comm 3, args rest
            // Note: comm might be truncated, args is better for display sometimes but long.
            // Let's rely on simple parsing. 
            // `ps` output is column aligned but split by space works if fields don't contain spaces (except last one).
            // COMM can contain spaces? usually not in this format or it's short. ARGS does.

            // Safer parsing:
            // PID %CPU %MEM COMMAND COMMAND_ARGS
            const pid = parts[0];
            const cpu = parseFloat(parts[1]);
            const mem = parseFloat(parts[2]);
            const name = parts[3]; // Short name
            const args = parts.slice(4).join(' '); // Full command line

            return { pid, cpu, mem, name, args };
        });

        return NextResponse.json({ processes });
    } catch (e) {
        return NextResponse.json({ error: 'Failed to fetch processes' }, { status: 500 });
    }
}
