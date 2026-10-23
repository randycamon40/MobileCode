import {defineConfig} from 'vite';
import preact from '@preact/preset-vite';
import tailwindcss from '@tailwindcss/vite';
import {VitePWA} from 'vite-plugin-pwa';
const headers={'Cross-Origin-Opener-Policy':'same-origin','Cross-Origin-Embedder-Policy':'require-corp'};
export default defineConfig({
  plugins:[preact(),tailwindcss(),VitePWA({registerType:'autoUpdate',
    manifest:{name:'MobileCode',short_name:'MobileCode',display:'standalone',background_color:'#14161a',theme_color:'#14161a',start_url:'/',
      icons:[{src:'icon.svg',sizes:'any',type:'image/svg+xml',purpose:'any maskable'}]},
    workbox:{maximumFileSizeToCacheInBytes:8e6}})],
  server:{headers},preview:{headers}});
