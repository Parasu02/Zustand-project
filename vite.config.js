import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
export default defineConfig(({ command, mode }) => {
    const env = loadEnv(mode, process.cwd(), '');
    return {
        base: '/Zustand-project/',
        plugins:[react()],
        define: {
            'process.env.API_END_POINT': JSON.stringify(env.API_END_POINT),
        },
    };
});
