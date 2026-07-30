import adapter from '@sveltejs/adapter-netlify';

console.log('### PHOENIX CONFIG LOADED — using adapter-netlify directly ###');

const config = {
    compilerOptions: {
        runes: ({ filename }) =>
            (filename.split(/[/\\]/).includes('node_modules') ? undefined : true)
    },
    kit: {
        adapter: adapter()
    }
};

export default config;
