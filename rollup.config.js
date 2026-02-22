import resolve from '@rollup/plugin-node-resolve';
import typescript from '@rollup/plugin-typescript';

export default {
    input: 'src/main.ts',
    output: {
        file: 'dist/game.js',
        format: 'iife',
        name: 'Game',
        sourcemap: true
    },
    plugins: [
        resolve(),
        typescript({
            tsconfig: './tsconfig.json',
            sourceMap: true,
            inlineSources: true
        })
    ]
};
