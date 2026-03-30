// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

// https://astro.build/config
export default defineConfig({
	integrations: [
		starlight({
			title: 'ContractIA',
			defaultLocale: 'es',
			locales: {
				es: { label: 'Español'},
			},
			social: [{ icon: 'github', label: 'GitHub', href: 'https://github.com/NickSalA/ContractIA' }],
			sidebar: [
				{
					label: 'Producto',
					autogenerate: { directory: 'producto' },
				},
				{
					label: 'Arquitectura',
					autogenerate: { directory: 'arquitectura' },
				},
				{
					label: 'Frontend',
					autogenerate: { directory: 'frontend' },
				},
				{
					label: 'Backend',
					autogenerate: { directory: 'backend' },
				},
				{
					label: 'IA y Datos',
					autogenerate: { directory: 'ia' },
				},
			],
		}),
	],
});
