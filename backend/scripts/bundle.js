import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const run = (command, args, options = {}) => {
    return new Promise((resolve, reject) => {
        console.log(`Running: ${command} ${args.join(' ')}`);
        const proc = spawn(command, args, { stdio: 'inherit', shell: true, ...options });
        proc.on('close', (code) => {
            if (code === 0) resolve();
            else reject(new Error(`${command} failed with code ${code}`));
        });
    });
};

async function bundle() {
    try {
        console.log('Building backend...');
        await run('npm', ['run', 'build']);

        console.log('Bundling with caxa...');
        // caxa --input . --output dist/doc-right.exe -- "{{node}}" "dist/server.js"
        const caxaArgs = [
            '--input', '.',
            '--output', 'dist/doc-right.exe',
            '--',
            '{{node}}',
            'dist/server.js'
        ];

        await run('npx', ['caxa', ...caxaArgs]);

        console.log('Success! Executable created at dist/doc-right.exe');
    } catch (err) {
        console.error('Bundle failed:', err);
        process.exit(1);
    }
}

bundle();
