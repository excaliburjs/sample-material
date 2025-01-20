import { globSync } from "glob";
import { defineConfig } from "vite";

console.log(globSync(["index.html", "src/**/*.html"]));
export default defineConfig({
    base: './', // optionally give a base path, useful for itch.io to serve relative instead of the default absolut
    // currently excalibur plugins are commonjs
    // this forces vite to keep things from bundling ESM together with commonjs
    optimizeDeps: {
        exclude: ["excalibur"],
    },
    build: {
        assetsInlineLimit: 0, // excalibur cannot handle inlined xml in prod mode
        sourcemap: true,
        // Vite uses rollup currently for prod builds so a separate config is needed
        // to keep vite from bundling ESM together with commonjs
        rollupOptions: {
            input: globSync(["index.html", "src/**/*.html"]),
            output: {
                inlineDynamicImports: false,
            }
        }
    }
});
