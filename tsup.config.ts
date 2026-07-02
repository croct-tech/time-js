import {readdirSync, readFileSync} from 'node:fs';
import {join, relative, sep} from 'node:path';
import {defineConfig} from 'tsup';

type PackageJson = {
    dependencies?: Record<string, string>,
    devDependencies?: Record<string, string>,
    peerDependencies?: Record<string, string>,
};

const packageJson = JSON.parse(readFileSync('package.json', 'utf8')) as PackageJson;
const requiredDependencies = Object.keys({
    ...(packageJson.dependencies ?? {}),
    ...(packageJson.peerDependencies ?? {}),
});
const bundledDependencies = Object.keys(packageJson.devDependencies ?? {});

const srcDir = 'src';

function listEntries(directory: string): Record<string, string> {
    const entries: Record<string, string> = {};

    for (const dirent of readdirSync(directory, {withFileTypes: true})) {
        const path = join(directory, dirent.name);

        if (dirent.isDirectory()) {
            Object.assign(entries, listEntries(path));

            continue;
        }

        if (!dirent.name.endsWith('.ts') || dirent.name.endsWith('.d.ts')) {
            continue;
        }

        const entryName = relative(srcDir, path)
            .slice(0, -'.ts'.length)
            .split(sep)
            .join('/');

        entries[entryName] = path;
    }

    return entries;
}

export default defineConfig({
    entry: listEntries(srcDir),
    outDir: 'build',
    format: ['esm', 'cjs'],
    dts: true,
    sourcemap: true,
    clean: true,
    bundle: true,
    splitting: true,
    treeshake: true,
    minify: true,
    platform: 'node',
    target: 'es2023',
    external: requiredDependencies,
    noExternal: bundledDependencies,
    outExtension: ({format}) => ({
        js: format === 'cjs' ? '.cjs' : '.js',
    }),
});
