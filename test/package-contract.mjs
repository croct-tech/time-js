import {execFile as execFileCallback} from 'node:child_process';
import {createRequire} from 'node:module';
import {mkdtemp,mkdir,rm,symlink,writeFile} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join,resolve} from 'node:path';
import {promisify} from 'node:util';
import {fileURLToPath} from 'node:url';
import assert from 'node:assert/strict';

const execFile = promisify(execFileCallback);
const require = createRequire(import.meta.url);
const rootDir = resolve(fileURLToPath(new URL('..', import.meta.url)));
const packageName = '@croct/time';

const imports = [
    packageName,
    `${packageName}/math`,
    `${packageName}/clock/fixedClock`,
];

async function assertRuntimeExports() {
    const [esmRoot, esmMath, esmFixedClock] = await Promise.all(imports.map(path => import(path)));
    const [cjsRoot, cjsMath, cjsFixedClock] = imports.map(path => require(path));

    assert.equal(typeof esmRoot.Instant, 'function');
    assert.equal(typeof cjsRoot.Instant, 'function');
    assert.equal(typeof esmMath.floorDiv, 'function');
    assert.equal(typeof cjsMath.floorDiv, 'function');
    assert.equal(typeof esmFixedClock.FixedClock, 'function');
    assert.equal(typeof cjsFixedClock.FixedClock, 'function');
}

async function assertTypescriptResolution() {
    const workspace = await mkdtemp(join(tmpdir(), 'croct-time-contract-'));

    try {
        await mkdir(join(workspace, 'node_modules', '@croct'), {recursive: true});
        await symlink(rootDir, join(workspace, 'node_modules', '@croct', 'time'), 'dir');
        await writeFile(
            join(workspace, 'package.json'),
            JSON.stringify({type: 'module'}, null, 4),
        );
        await writeFile(
            join(workspace, 'index.ts'),
            [
                "import {Instant} from '@croct/time';",
                "import {floorDiv} from '@croct/time/math';",
                "import {FixedClock} from '@croct/time/clock/fixedClock';",
                '',
                'void Instant;',
                'void floorDiv;',
                'void FixedClock;',
                '',
            ].join('\n'),
        );

        await execFile(
            process.execPath,
            [
                require.resolve('typescript/bin/tsc'),
                '--noEmit',
                '--module',
                'NodeNext',
                '--moduleResolution',
                'NodeNext',
                '--target',
                'ES2022',
                '--strict',
                'index.ts',
            ],
            {cwd: workspace},
        );
    } finally {
        await rm(workspace, {force: true, recursive: true});
    }
}

await assertRuntimeExports();
await assertTypescriptResolution();
await execFile('npm', ['pack', '--dry-run'], {cwd: rootDir});
