import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import util from 'util';

const execAsync = util.promisify(exec);

export async function POST(req: Request) {
    try {
        const { action } = await req.json();

        if (action === 'reboot') {
            // Trigger reboot. This will kill the server obviously.
            exec('sudo reboot');
            return NextResponse.json({ success: true, message: 'System is rebooting...' });
        }

        if (action === 'upgrade') {
            // This can take a long time. 
            // We'll try to run it in background or just standard exec.
            // apt-get upgrade -y might hang on prompts. DEBIAN_FRONTEND=noninteractive is needed.
            const cmd = 'sudo DEBIAN_FRONTEND=noninteractive apt-get update && sudo DEBIAN_FRONTEND=noninteractive apt-get upgrade -y';
            exec(cmd); // Fire and forget mostly, or it might zombie.
            return NextResponse.json({ success: true, message: 'System upgrade started in background.' });
        }

        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    } catch (e: any) {
        return NextResponse.json({ error: e.message || 'Action failed' }, { status: 500 });
    }
}
