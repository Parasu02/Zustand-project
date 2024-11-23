import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import ghPages from 'vite-plugin-gh-pages';
export default defineConfig(({ command, mode }) => {
    const env = loadEnv(mode, process.cwd(), '');
    return {
        base: '/new-one/',
        plugins: [react(), ghPages()],
        define: {
            'process.env.API_END_POINT': JSON.stringify(env.API_END_POINT),
        },
    };
});
