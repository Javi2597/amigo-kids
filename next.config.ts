import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Next escribe archivos de reglas para herramientas de IA en cada `next dev`.
  // No forman parte del proyecto, así que se desactivan.
  agentRules: false,
};

export default nextConfig;