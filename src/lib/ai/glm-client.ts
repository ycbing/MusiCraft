interface GLMResponse {
  choices: { message: { content: string } }[]
}

export async function glmChat(
  messages: { role: 'system' | 'user' | 'assistant'; content: string }[],
  options?: { temperature?: number; maxTokens?: number }
) {
  const apiKey = process.env.GLM_API_KEY
  const baseUrl = process.env.GLM_BASE_URL || 'https://open.bigmodel.cn/api/paas/v4'

  const res = await fetch(`${baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: process.env.LLM_MODEL || 'glm-4-flash',
      messages,
      temperature: options?.temperature ?? 0.8,
      max_tokens: options?.maxTokens ?? 2048,
    }),
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`GLM API error: ${res.status} ${text}`)
  }

  const data: GLMResponse = await res.json()
  return data.choices[0]?.message?.content || ''
}
