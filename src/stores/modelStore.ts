import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Model, ModelBadge } from '@/types'
import { api } from '@/services/api'

interface ModelState {
  models: Model[]
  selectedModelId: string | null
  isLoading: boolean
  isConnected: boolean
  error: string | null

  // Actions
  loadModels: () => Promise<void>
  selectModel: (modelId: string) => void
  checkConnection: () => Promise<boolean>
}

export const useModelStore = create<ModelState>()(
  persist(
    (set, get) => ({
      models: [],
      selectedModelId: null,
      isLoading: false,
      isConnected: false,
      error: null,

      loadModels: async () => {
        set({ isLoading: true, error: null })
        try {
          const allModels = await api.getModels()
          // Filter out embedding models (nomic-embed-text, etc.)
          const models = allModels.filter(
            (m) => !m.id.toLowerCase().includes('embed') && !m.id.toLowerCase().includes('nomic')
          )
          set({ models, isLoading: false, isConnected: true })

          // Auto-select first model if none selected
          const { selectedModelId } = get()
          if (!selectedModelId || !models.find((m) => m.id === selectedModelId)) {
            if (models[0]) {
              set({ selectedModelId: models[0].id })
            }
          }
        } catch (error) {
          set({
            isLoading: false,
            isConnected: false,
            error: error instanceof Error ? error.message : 'Failed to load models',
          })
        }
      },

      selectModel: (modelId) => set({ selectedModelId: modelId }),

      checkConnection: async () => {
        try {
          await api.getModels()
          set({ isConnected: true })
          return true
        } catch {
          set({ isConnected: false })
          return false
        }
      },
    }),
    {
      name: 'modelgarden-models',
      partialize: (state) => ({ selectedModelId: state.selectedModelId }),
    }
  )
)

// Helper functions
export function getModelDisplayName(modelId: string): string {
  const parts = modelId.split('/')
  const name = parts[parts.length - 1] ?? modelId
  return name
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

export function getModelBadge(modelId: string): ModelBadge {
  const id = modelId.toLowerCase()
  if (id.includes('embed')) return { text: 'Embed', type: 'embed' }
  if (id.includes('vl') || id.includes('vision')) return { text: 'Vision', type: 'vision' }
  return { text: 'Chat', type: 'chat' }
}

export function isVisionModel(modelId: string): boolean {
  const id = modelId.toLowerCase()
  return id.includes('vl') || id.includes('vision')
}

// =============================================================================
// Model Knowledge Map — describes what each model is best at
// =============================================================================
export interface ModelInfo {
  description: string
  bestFor: string[]         // Short task tags e.g. "Coding", "Reasoning"
  capabilities: string[]    // Emoji + label chips e.g. "🧠 Deep Reasoning"
  speed: 'fast' | 'medium' | 'slow'
  size: string              // Human-readable e.g. "4B params"
}

const MODEL_KNOWLEDGE_MAP: Record<string, ModelInfo> = {
  'google/gemma-3-4b': {
    description: 'Google Gemma 3 is a lightweight, fast multimodal model great for everyday tasks and image understanding.',
    bestFor: ['General Chat', 'Image Analysis', 'Summarization', 'Quick Q&A'],
    capabilities: ['👁️ Vision', '⚡ Fast Responses', '🌍 Multilingual', '📝 Summarization'],
    speed: 'fast',
    size: '4B params',
  },
  'qwen/qwen3-vl-4b': {
    description: 'Qwen3 VL is a vision-language model optimized for tool use, image reasoning, and document understanding.',
    bestFor: ['Document Analysis', 'Tool Use', 'Vision + Text', 'OCR'],
    capabilities: ['👁️ Vision', '🔧 Tool Use', '📄 Document OCR', '⚡ Fast'],
    speed: 'fast',
    size: '4B params',
  },
  'qwen/qwen3-vl-8b': {
    description: 'Larger Qwen3 VL with stronger vision understanding and more reliable tool use.',
    bestFor: ['Complex Vision Tasks', 'Tool Use', 'Document Analysis', 'Detailed OCR'],
    capabilities: ['👁️ Vision', '🔧 Tool Use', '📄 Document OCR', '🧠 Stronger Reasoning'],
    speed: 'medium',
    size: '8B params',
  },
  'deepseek/deepseek-r1-0528-qwen3-8b': {
    description: 'DeepSeek R1 is a reasoning-focused model that thinks step-by-step before answering. Ideal for math, logic, and complex coding.',
    bestFor: ['Mathematics', 'Coding', 'Logic & Reasoning', 'Science'],
    capabilities: ['🧠 Deep Reasoning', '💻 Code Generation', '📐 Math', '🔍 Step-by-Step Analysis'],
    speed: 'medium',
    size: '8B params',
  },
  'openai/gpt-oss-20b': {
    description: 'OpenAI GPT OSS 20B is a large, high-quality model for complex instructions, creative writing, and nuanced conversation.',
    bestFor: ['Creative Writing', 'Complex Instructions', 'Research', 'Long-form Content'],
    capabilities: ['✍️ Creative Writing', '📚 Long Context', '🎯 Instruction Following', '🔬 Research'],
    speed: 'medium',
    size: '20B params',
  },
  'nvidia/nemotron-3-nano': {
    description: 'NVIDIA Nemotron is a large enterprise-grade model tuned for tool use and complex agentic workflows.',
    bestFor: ['Agentic Tasks', 'Tool Use', 'Enterprise Workflows', 'Complex Instructions'],
    capabilities: ['🔧 Tool Use', '🤖 Agentic', '🧠 Large Context', '🏢 Enterprise Grade'],
    speed: 'slow',
    size: '30B params',
  },
  'mistralai/mistral-7b-instruct-v0.3': {
    description: 'Mistral 7B is a fast, efficient European model great for instruction following and general tasks.',
    bestFor: ['Quick Chat', 'Instruction Tasks', 'Summarization', 'Translation'],
    capabilities: ['⚡ Very Fast', '📝 Instruction Following', '🌍 Multilingual', '🔒 Privacy-Focused'],
    speed: 'fast',
    size: '7B params',
  },
  'deepseek/deepseek-r1-0528-qwen3-8b@q4_k_m': {
    description: 'DeepSeek R1 (quantized) — same reasoning capabilities with reduced memory footprint.',
    bestFor: ['Mathematics', 'Coding', 'Logic & Reasoning'],
    capabilities: ['🧠 Deep Reasoning', '💻 Code Generation', '📐 Math'],
    speed: 'medium',
    size: '8B params (Q4)',
  },
}

// Task → best model mapping
const TASK_MODEL_MAP: Record<string, string> = {
  'General Chat': 'google/gemma-3-4b',
  'Coding': 'deepseek/deepseek-r1-0528-qwen3-8b',
  'Math': 'deepseek/deepseek-r1-0528-qwen3-8b',
  'Vision': 'qwen/qwen3-vl-4b',
  'Writing': 'openai/gpt-oss-20b',
  'Research': 'openai/gpt-oss-20b',
  'Documents': 'qwen/qwen3-vl-4b',
  'Reasoning': 'deepseek/deepseek-r1-0528-qwen3-8b',
  'Tool Use': 'nvidia/nemotron-3-nano',
  'Quick Q&A': 'google/gemma-3-4b',
}

export const TASK_SUGGESTIONS = Object.keys(TASK_MODEL_MAP)

export function getModelInfo(modelId: string): ModelInfo {
  // Try exact match first
  if (MODEL_KNOWLEDGE_MAP[modelId]) return MODEL_KNOWLEDGE_MAP[modelId]
  // Try prefix match (handles quantization suffixes)
  const base = Object.keys(MODEL_KNOWLEDGE_MAP).find(k => modelId.startsWith(k))
  if (base) return MODEL_KNOWLEDGE_MAP[base]!
  // Generic fallback
  const badge = getModelBadge(modelId)
  return {
    description: 'A local AI model available for chat.',
    bestFor: badge.type === 'vision' ? ['Vision', 'General Chat'] : ['General Chat'],
    capabilities: badge.type === 'vision' ? ['👁️ Vision', '💬 Chat'] : ['💬 Chat'],
    speed: 'medium',
    size: 'Unknown',
  }
}

export function getBestModelForTask(task: string, loadedModelIds: string[]): string | null {
  const preferred = TASK_MODEL_MAP[task]
  if (preferred && loadedModelIds.includes(preferred)) return preferred
  // Fallback: find any loaded model
  return loadedModelIds[0] ?? null
}
