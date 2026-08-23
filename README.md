# Parallelism

[![CI](https://github.com/parani-zenteiq-ai/parallelism/actions/workflows/ci.yml/badge.svg)](https://github.com/parani-zenteiq-ai/parallelism/actions/workflows/ci.yml)
[![Deploy](https://github.com/parani-zenteiq-ai/parallelism/actions/workflows/deploy.yml/badge.svg)](https://github.com/parani-zenteiq-ai/parallelism/actions/workflows/deploy.yml)
[![Live Site](https://img.shields.io/badge/live%20site-view-6a4cff)](https://parani-zenteiq-ai.github.io/parallelism/)

**Live site: https://parani-zenteiq-ai.github.io/parallelism/**

An interactive, from-scratch teaching site explaining how LLMs get trained across thousands of
GPUs — starting from arithmetic and matrix multiplication, up through data/tensor/pipeline
parallelism, ZeRO/FSDP, and MoE. Written by [Paranidharan Muruganantham](https://github.com/baranidharan27)
and Pinakin Choudary as they learn the material themselves.

## Development

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

Deploys automatically to GitHub Pages on every push to `main` via
`.github/workflows/deploy.yml`.
