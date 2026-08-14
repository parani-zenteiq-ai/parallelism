export interface ChapterMeta {
  slug: string
  order: number
  title: string
  summary: string
}

export const chapters: ChapterMeta[] = [
  {
    slug: 'why-parallelism',
    order: 1,
    title: 'Why Parallelism',
    summary: 'Model size vs. single-GPU memory and compute limits.',
  },
  {
    slug: 'collectives',
    order: 2,
    title: 'Hardware & Collectives Primer',
    summary: 'GPU memory hierarchy, interconnects, and the collective ops everything else is built from.',
  },
  {
    slug: 'data-parallel',
    order: 3,
    title: 'Data Parallelism',
    summary: 'Replicate the model, shard the data, sync gradients.',
  },
  {
    slug: 'zero-fsdp',
    order: 4,
    title: 'ZeRO / FSDP',
    summary: 'Sharding optimizer states, gradients, and parameters to break the replication wall.',
  },
  {
    slug: 'tensor-parallel',
    order: 5,
    title: 'Tensor Parallelism',
    summary: 'Column- and row-parallel layers that split a single layer across devices.',
  },
  {
    slug: 'pipeline-parallel',
    order: 6,
    title: 'Pipeline Parallelism',
    summary: 'Splitting the model by depth, micro-batching, and the bubble problem.',
  },
  {
    slug: 'sequence-parallel',
    order: 7,
    title: 'Sequence / Context Parallelism',
    summary: 'Sharding the sequence dimension for long-context training.',
  },
  {
    slug: 'moe',
    order: 8,
    title: 'Expert Parallelism (MoE)',
    summary: 'Routing tokens to experts spread across devices.',
  },
  {
    slug: 'putting-it-together',
    order: 9,
    title: 'Putting It Together',
    summary: '3D/4D parallelism and how to choose a strategy for your cluster.',
  },
]

export function nextChapter(slug: string): ChapterMeta | undefined {
  const i = chapters.findIndex((c) => c.slug === slug)
  return i >= 0 ? chapters[i + 1] : undefined
}

export function prevChapter(slug: string): ChapterMeta | undefined {
  const i = chapters.findIndex((c) => c.slug === slug)
  return i > 0 ? chapters[i - 1] : undefined
}
