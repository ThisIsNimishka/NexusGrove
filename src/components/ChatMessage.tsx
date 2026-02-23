import { memo, useEffect, useRef, useState } from 'react'
import { User, Bot, Zap, Clock, Hash, Square, Copy, Check } from 'lucide-react'
import { cn, formatRelativeTime } from '@/lib/utils'
import type { Message, MessageContent, StreamMetrics } from '@/types'

interface ChatMessageProps {
  message: Message
  isStreaming?: boolean
}

export const ChatMessage = memo(function ChatMessage({
  message,
  isStreaming = false,
}: ChatMessageProps) {
  const [copied, setCopied] = useState(false)
  const isUser = message.role === 'user'
  const content = formatContent(message.content)
  const contentRef = useRef<HTMLDivElement>(null)

  // Add copy functionality to code blocks
  useEffect(() => {
    if (!contentRef.current) return

    const copyButtons = contentRef.current.querySelectorAll('.code-copy-btn')
    const handlers = new Map<Element, () => Promise<void>>()

    copyButtons.forEach((btn) => {
      const handleClick = async () => {
        const codeBlock = btn.closest('.code-block-wrapper')?.querySelector('code')
        if (codeBlock) {
          await navigator.clipboard.writeText(codeBlock.textContent || '')
          btn.innerHTML = '<svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg> Copied'
          btn.classList.add('text-accent-cyan')
          setTimeout(() => {
            btn.innerHTML = '<svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg> Copy'
            btn.classList.remove('text-accent-cyan')
          }, 2000)
        }
      }
      handlers.set(btn, handleClick)
      btn.addEventListener('click', handleClick)
    })

    // Cleanup: remove all event listeners
    return () => {
      handlers.forEach((handler, btn) => {
        btn.removeEventListener('click', handler)
      })
    }
  }, [content.html])

  const handleCopyFull = async () => {
    const plainText = typeof message.content === 'string'
      ? message.content
      : message.content.filter(p => p.type === 'text').map(p => p.type === 'text' ? p.text : '').join('\n')

    await navigator.clipboard.writeText(plainText)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div
      className={cn(
        'flex gap-3.5 max-w-[95%] animate-message-enter',
        isUser && 'self-end flex-row-reverse'
      )}
    >
      {/* Avatar & Timestamp */}
      <div className="flex flex-col items-center gap-1.5 shrink-0">
        <div
          className={cn(
            'w-8 h-8 rounded-lg flex items-center justify-center',
            isUser
              ? 'bg-card border border-border'
              : 'bg-gradient-to-br from-primary to-accent shadow-[0_0_20px_hsl(var(--primary)/0.3)]'
          )}
        >
          {isUser ? (
            <User className="w-4 h-4 text-muted-foreground" />
          ) : (
            <Bot className="w-4 h-4 text-primary-foreground" />
          )}
        </div>
        <span className="text-[10px] text-muted-foreground/60 font-medium whitespace-nowrap">
          {formatRelativeTime(message.timestamp)}
        </span>
      </div>

      {/* Content */}
      <div
        className={cn(
          'group/msg relative rounded-2xl px-5 py-3.5 text-sm leading-relaxed transition-all',
          isUser
            ? 'glass bg-primary/20 border-primary/30 text-foreground ml-auto'
            : 'glass-card text-foreground/90'
        )}
      >
        {!isUser && !isStreaming && content.html && (
          <button
            onClick={handleCopyFull}
            className="absolute top-2 right-2 p-1.5 rounded-lg bg-background/50 border border-border opacity-0 group-hover/msg:opacity-100 transition-opacity hover:bg-background z-10"
            title="Copy response"
          >
            {copied ? (
              <Check className="w-3.5 h-3.5 text-accent-cyan" />
            ) : (
              <Copy className="w-3.5 h-3.5 text-muted-foreground" />
            )}
          </button>
        )}
        {isStreaming && !content.html ? (
          <TypingIndicator />
        ) : (
          <>
            <div
              ref={contentRef}
              className="prose prose-invert prose-sm max-w-none"
              dangerouslySetInnerHTML={{ __html: content.html }}
            />
            {isStreaming && (
              <span className="inline-block w-[2px] h-[1em] bg-primary ml-0.5 align-middle animate-typing-cursor" />
            )}
            {content.images.map((img, i) => (
              <img
                key={i}
                src={img}
                alt="Uploaded"
                className="max-w-[300px] rounded-lg mt-3"
              />
            ))}
            {!isUser && message.metrics && (
              <MetricsDisplay metrics={message.metrics} />
            )}
          </>
        )}
      </div>
    </div>
  )
})

function TypingIndicator() {
  return (
    <div className="flex gap-1 py-1">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="w-2 h-2 rounded-full bg-primary animate-typing"
          style={{ animationDelay: `${i * 0.2}s` }}
        />
      ))}
    </div>
  )
}

function MetricsDisplay({ metrics }: { metrics: StreamMetrics }) {
  return (
    <div className="flex flex-wrap items-center gap-3 mt-3 pt-3 border-t border-border/50 text-[10px] text-muted-foreground">
      <span className="flex items-center gap-1">
        <Zap className="w-3 h-3 text-primary" />
        {metrics.tokensPerSecond.toFixed(2)} tok/sec
      </span>
      <span className="flex items-center gap-1">
        <Hash className="w-3 h-3" />
        {metrics.totalTokens} tokens
      </span>
      <span className="flex items-center gap-1">
        <Clock className="w-3 h-3" />
        {metrics.timeToFirstToken.toFixed(2)}s to first token
      </span>
      <span className="flex items-center gap-1">
        <Square className="w-3 h-3" />
        {metrics.stopReason}
      </span>
    </div>
  )
}

function formatContent(content: MessageContent): { html: string; images: string[] } {
  const images: string[] = []
  let text: string

  if (typeof content === 'string') {
    text = content
  } else {
    const textParts: string[] = []
    for (const part of content) {
      if (part.type === 'text') {
        textParts.push(part.text)
      } else if (part.type === 'image_url') {
        images.push(part.image_url.url)
      }
    }
    text = textParts.join('\n')
  }

  // First escape all HTML
  let html = escapeHtml(text)

  // Code blocks with language label and copy button
  html = html.replace(/```(\w*)\n([\s\S]*?)```/g, (_, lang, code) => {
    const language = lang || 'code'
    return `<div class="code-block-wrapper my-3 rounded-lg overflow-hidden border border-border">
      <div class="flex items-center justify-between px-3 py-2 bg-secondary/80 border-b border-border">
        <span class="text-sm text-muted-foreground font-mono font-medium">${language}</span>
        <button class="code-copy-btn flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
          <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
          Copy
        </button>
      </div>
      <pre class="bg-secondary/50 p-3 overflow-x-auto m-0"><code class="font-mono text-xs">${code}</code></pre>
    </div>`
  })

  // Inline code
  html = html.replace(/`([^`]+)`/g, '<code class="bg-secondary px-1.5 py-0.5 rounded text-xs font-mono">$1</code>')

  // Bold
  html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')

  // Italic
  html = html.replace(/(?<!\*)\*([^*]+)\*(?!\*)/g, '<em>$1</em>')

  // Headers (process longest first to avoid partial matches)
  html = html.replace(/^###### (.+)$/gm, '<h6 class="text-xs font-bold mt-3 mb-1 text-muted-foreground">$1</h6>')
  html = html.replace(/^##### (.+)$/gm, '<h5 class="text-sm font-bold mt-3 mb-1">$1</h5>')
  html = html.replace(/^#### (.+)$/gm, '<h4 class="text-sm font-bold mt-4 mb-2">$1</h4>')
  html = html.replace(/^### (.+)$/gm, '<h3 class="text-base font-bold mt-4 mb-2">$1</h3>')
  html = html.replace(/^## (.+)$/gm, '<h2 class="text-lg font-bold mt-4 mb-2">$1</h2>')
  html = html.replace(/^# (.+)$/gm, '<h1 class="text-xl font-bold mt-4 mb-2">$1</h1>')

  // Horizontal rules
  html = html.replace(/^---$/gm, '<hr class="border-border my-4">')

  // Unordered lists
  html = html.replace(/^- (.+)$/gm, '<li class="ml-4 list-disc">$1</li>')

  // Ordered lists
  html = html.replace(/^\d+\. (.+)$/gm, '<li class="ml-4 list-decimal">$1</li>')

  // Process tables AFTER escaping (so table HTML isn't escaped)
  html = processMarkdownTables(html)

  // Line breaks (but not after block elements)
  html = html.replace(/(?<!<\/li>|<\/h[123]>|<\/table>|<\/div>|<\/pre>|<\/ul>|<hr[^>]*>)\n/g, '<br>')

  return { html, images }
}

function processMarkdownTables(text: string): string {
  const lines = text.split('\n')
  const result: string[] = []
  let i = 0

  while (i < lines.length) {
    const line = lines[i] ?? ''

    // Check if this line could be a table header (contains |)
    if (line.includes('|') && i + 1 < lines.length) {
      const nextLine = lines[i + 1] ?? ''

      // Check if next line is a separator (contains | and -)
      if (nextLine.match(/^\|?[\s-:|]+\|[\s-:|]*$/)) {
        // This is a table - parse it
        const tableLines: string[] = [line]
        let j = i + 1

        // Collect all table lines
        while (j < lines.length && (lines[j]?.includes('|') ?? false)) {
          tableLines.push(lines[j]!)
          j++
        }

        // Convert to HTML table
        const tableHtml = convertTableToHtml(tableLines)
        result.push(tableHtml)
        i = j
        continue
      }
    }

    result.push(line)
    i++
  }

  return result.join('\n')
}

function convertTableToHtml(lines: string[]): string {
  if (lines.length < 2) return lines.join('\n')

  const parseRow = (line: string): string[] => {
    return line
      .split('|')
      .map(cell => cell.trim())
      .filter((_, idx, arr) => idx > 0 && idx < arr.length - 1 || arr.length <= 2)
      .filter(cell => cell !== '')
  }

  const headerCells = parseRow(lines[0] ?? '')
  // Skip separator line (index 1)
  const bodyRows = lines.slice(2).map(parseRow)

  let html = '<div class="overflow-x-auto my-4"><table class="w-full border-collapse text-sm">'

  // Header
  html += '<thead><tr class="border-b border-border bg-secondary/50">'
  for (const cell of headerCells) {
    html += `<th class="px-3 py-2 text-left font-semibold text-foreground">${cell}</th>`
  }
  html += '</tr></thead>'

  // Body
  html += '<tbody>'
  for (const row of bodyRows) {
    html += '<tr class="border-b border-border/50 hover:bg-secondary/30">'
    for (const cell of row) {
      html += `<td class="px-3 py-2 text-muted-foreground">${cell}</td>`
    }
    html += '</tr>'
  }
  html += '</tbody></table></div>'

  return html
}

function escapeHtml(text: string): string {
  const div = document.createElement('div')
  div.textContent = text
  return div.innerHTML
}
