import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Avoids dev-only RSC manifest errors around `segment-explorer-node` /
  // SegmentViewNode (Next 15 devtools). Production builds are unaffected.
  experimental: {
    devtoolSegmentExplorer: false,
  },
};

export default nextConfig;
