import { NextResponse } from 'next/server';
import simpleGit from 'simple-git';
import path from 'path';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { projectPath, action } = body;

        if (!projectPath || !projectPath.startsWith('/root/') || projectPath.includes('..')) {
            return NextResponse.json({ error: 'Invalid project path' }, { status: 400 });
        }

        const git = simpleGit(projectPath);

        let result;

        switch (action) {
            case 'pull':
                result = await git.pull();
                break;
            case 'fetch':
                result = await git.fetch();
                break;
            case 'log':
                result = await git.log({ maxCount: 10 });
                break;
            case 'status':
                result = await git.status();
                break;
            default:
                return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
        }

        return NextResponse.json({ success: true, data: result });
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
