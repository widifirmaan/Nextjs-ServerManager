import { NextResponse } from 'next/server';
import Docker from 'dockerode';

const docker = new Docker({ socketPath: '/var/run/docker.sock' });

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const images = await docker.listImages();
        return NextResponse.json(images);
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const { image } = await req.json();
        if (!image) return NextResponse.json({ error: 'Image name required' }, { status: 400 });

        await new Promise((resolve, reject) => {
            docker.pull(image, (err: any, stream: any) => {
                if (err) return reject(err);
                docker.modem.followProgress(stream, onFinished, onProgress);

                function onFinished(err: any, output: any) {
                    if (err) return reject(err);
                    resolve(output);
                }
                function onProgress(event: any) {
                    // Optional: could log specific progress
                }
            });
        });

        return NextResponse.json({ success: true, message: `Image ${image} pulled successfully` });
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');

        if (!id) return NextResponse.json({ error: 'Image ID required' }, { status: 400 });

        const image = docker.getImage(id);
        await image.remove({ force: true }); // Using force to ensure removal even if tagged

        return NextResponse.json({ success: true });
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
