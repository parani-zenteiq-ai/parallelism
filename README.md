# Parallelism

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
