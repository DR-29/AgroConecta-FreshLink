import adapter from '@sveltejs/adapter-auto';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [
		sveltekit({
			adapter: adapter(),
			alias: {
				$lib: 'src/lib'
			}
		})
	],
	server: {
		proxy: {
			'/api/v1': {
				target: 'http://localhost:8000',
				changeOrigin: true
			},
			'/api/aux': {
				target: 'http://localhost:3000',
				changeOrigin: true,
				rewrite: (path) => path.replace(/^\/api\/aux/, '/api')
			}
		}
	}
});
