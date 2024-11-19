/* eslint-disable import/no-anonymous-default-export */
import resolve from '@rollup/plugin-node-resolve';
import typescript from '@rollup/plugin-typescript';

export default {
  input: 'src/index.ts', 
  output: {
    dir: 'lib',
    format: 'es',
    exports: 'named',
    sourcemap: true,
    preserveModules: true,
    entryFileNames: '[name].js',
    globals: { react: 'React', 'react-dom': 'ReactDom' },
  },
  plugins: [
    resolve({
      extensions: ['.js', '.ts'],
    }),
    typescript({ tsconfig: './tsconfig2.json' }),
  ],
    // Updated external configuration
    external: (id) => {
        // Exclude entry point explicitly
        if (id === 'src/index.ts') return false;
    
        // Mark all other non-relative and non-absolute imports as external
        return !id.startsWith('.') && !id.startsWith('/');
      },
};
