import { NextResponse } from 'next/server';
import simpleGit from 'simple-git';
import fs from 'fs/promises';
import path from 'path';

const ROOT_DIR = '/root';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        // Check if we can access the directory
        try {
            await fs.access(ROOT_DIR);
        } catch (e) {
            return NextResponse.json({
                error: `Cannot access ${ROOT_DIR}. Please ensure the process has root privileges.`
            }, { status: 403 });
        }

        const entries = await fs.readdir(ROOT_DIR, { withFileTypes: true });
        const directories = entries.filter(e => e.isDirectory());

        const gitProjects = [];

        for (const dir of directories) {
            const fullPath = path.join(ROOT_DIR, dir.name);
            const gitPath = path.join(fullPath, '.git');

            try {
                await fs.access(gitPath);

                // It is a git repo
                const git = simpleGit(fullPath);

                // Get basic info in parallel
                try {
                    const [status, remotes] = await Promise.all([
                        git.status(),
                        git.getRemotes(true)
                    ]);

                    const lastCommit = await git.log({ maxCount: 1 }).catch(() => null);

                    gitProjects.push({
                        name: dir.name,
                        path: fullPath,
                        branch: status.current,
                        isClean: status.isClean(),
                        ahead: status.ahead,
                        behind: status.behind,
                        filesChanged: status.files.length,
                        remote: remotes[0]?.refs?.fetch || '',
                        lastCommit: lastCommit?.latest ? {
                            message: lastCommit.latest.message,
                            date: lastCommit.latest.date,
                            author_name: lastCommit.latest.author_name
                        } : null
                    });
                } catch (err) {
                    console.error(`Error reading git info for ${dir.name}:`, err);
                    gitProjects.push({
                        name: dir.name,
                        path: fullPath,
                        error: 'Failed to read git info'
                    });
                }

            } catch (e) {
                // Not a git repo, skip
            }
        }

        return NextResponse.json(gitProjects);
    } catch (err: any) {
        console.error('Error listing git projects:', err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
