import {readdirSync} from 'fs';
import {join, relative} from 'path';

const SOURCE_DIRECTORY = join(__dirname, '..', 'src');

/**
 * Lists every module of the package, so one added later is covered without
 * being remembered here.
 */
function listModules(directory: string = SOURCE_DIRECTORY): string[] {
    return readdirSync(directory, {withFileTypes: true}).flatMap(entry => {
        const path = join(directory, entry.name);

        if (entry.isDirectory()) {
            return listModules(path);
        }

        return entry.name.endsWith('.ts') && !entry.name.endsWith('.d.ts')
            ? [path]
            : [];
    });
}

describe.each(listModules().map(path => [relative(SOURCE_DIRECTORY, path), path]))(
    'The %s module',
    (_, path: string) => {
        it('should load when it is the first module of the package to be loaded', () => {
            // The modules of the package refer to each other in cycles, so one
            // that reads a value of another while that other is still loading
            // reads nothing at all. Which module is loaded first is the caller's
            // choice, and every choice has to work.
            jest.isolateModules(() => {
                /* eslint-disable-next-line @typescript-eslint/no-require-imports, import-x/no-dynamic-require
                   -- Loading a module found at run time is what is under test. */
                expect(() => require(path)).not.toThrow();
            });
        });
    },
);
