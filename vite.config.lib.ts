import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
    plugins: [react()],
    build: {
        lib: {
            entry: path.resolve(__dirname, 'src/index.ts'),
            name: 'index',
            fileName: 'index',
            formats: ['es'],
        },
        outDir: 'lib',
        minify: false,
        rollupOptions: {
            external: [
                'react',
                'react-dom',
                'react-dom/client',
                'react/jsx-runtime' 
            ],
            output: {
                globals: {
                    react: 'React',
                    'react-dom': 'ReactDOM',
                    'react-dom/client': 'ReactDOMClient',
                    'react/jsx-runtime': 'jsxRuntime' 
                },
            },
        },
    },
});
