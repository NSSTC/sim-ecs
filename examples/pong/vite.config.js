import { defineConfig } from 'vite';
import { resolve } from 'path';


export default defineConfig({
    resolve: {
        alias: {
            'sim-ecs': resolve(__dirname, 'node_modules/sim-ecs'),
        }
    },
});
