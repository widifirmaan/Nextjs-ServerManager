import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import util from 'util';

const execAsync = util.promisify(exec);

export async function POST(req: Request) {
    try {
        const { pid, action } = await req.json();

        if (action === 'kill') {
            if (!pid) return NextResponse.json({ error: 'PID required' }, { status: 400 });
            await execAsync(`kill -9 ${pid}`);
            return NextResponse.json({ success: true, message: `Process ${pid} killed` });
        }

        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    } catch (e: any) {
        return NextResponse.json({ error: e.message || 'Action failed' }, { status: 500 });
    }
}
