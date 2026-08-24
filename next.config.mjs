/**
 * Static export configuration.
 *
 * GitHub Pages serves files, not a Node process, so the whole site is
 * prerendered to HTML into `out/`. Two consequences worth knowing:
 *
 *  - `next/image` optimisation needs a server, so it is turned off. Images are
 *    served exactly as provided.
 *  - A project page lives at username.github.io/<repo>, so every asset and link
 *    needs that prefix. The deploy workflow sets NEXT_PUBLIC_BASE_PATH from the
 *    repository name automatically. Leave it empty for a custom domain or a
 *    username.github.io root site.
 */
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  basePath,
  assetPrefix: basePath || undefined,
  // GitHub Pages resolves /shop/ to /shop/index.html; without this, /shop 404s.
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
