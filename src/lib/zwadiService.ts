/**
 * Zawadi AI Service
 * Utility functions for generating AI content for Investment Briefs and Sector Analysis
 */

interface ZwadiResponse {
  success: boolean
  conversation_id: number
  message: string
  sources: string[]
  suggested_followups: string[]
  query_type: string
}

/**
 * Generate investment brief for a country using Zawadi AI
 */
export async function generateInvestmentBrief(
  countryName: string,
  context: 'ISI' | 'METI'
): Promise<{ setup: string; positioning: string; confidence: string; updatedAt: string } | null> {
  try {
    const prompt = context === 'ISI'
      ? `Generate a concise investment brief for ${countryName} based on its current ISI score and macroeconomic indicators. Provide two sections:

1. Setup (2-3 sentences): Current macroeconomic situation, key indicators, and stability factors
2. Positioning (2-3 sentences): Investment positioning recommendations and risk considerations

Keep it professional, data-driven, and concise. Focus on actionable insights for investors.`
      : `Generate a concise investment brief for ${countryName} based on its METI forecast and market entry timing. Provide two sections:

1. Setup (2-3 sentences): Current market entry conditions, timing signals, and opportunity windows
2. Positioning (2-3 sentences): Tactical positioning for market entry and sectors to watch

Keep it professional, data-driven, and concise. Focus on market entry timing insights.`

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/chat/send`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('access_token')}`
      },
      body: JSON.stringify({
        message: prompt
      })
    })

    if (!response.ok) {
      console.error('Failed to generate investment brief:', response.statusText)
      return null
    }

    const data: ZwadiResponse = await response.json()

    if (data.success && data.message) {
      // Parse the AI response to extract Setup and Positioning sections
      const setupMatch = data.message.match(/(?:Setup|1\..*Setup)[:\s]*([\s\S]*?)(?=(?:Positioning|2\.|$))/i)
      const positioningMatch = data.message.match(/(?:Positioning|2\..*Positioning)[:\s]*(.*?)$/i)

      const setup = setupMatch
        ? setupMatch[1].trim().replace(/^\*\*|\*\*$/g, '').trim()
        : data.message.substring(0, 300) // Fallback to first 300 chars

      const positioning = positioningMatch
        ? positioningMatch[1].trim().replace(/^\*\*|\*\*$/g, '').trim()
        : data.message.substring(300, 600) // Fallback to next 300 chars

      // Determine confidence based on sources
      const confidence = data.sources && data.sources.length > 0 ? 'High Confidence' : 'Medium Confidence'

      return {
        setup,
        positioning,
        confidence,
        updatedAt: 'Just now'
      }
    }

    return null
  } catch (error) {
    console.error('Error generating investment brief:', error)
    return null
  }
}

/**
 * Generate sector outlook for a specific sector using Zawadi AI
 */
export async function generateSectorOutlook(
  sectorName: string,
  countryName?: string
): Promise<{ outlook: 'Favorable' | 'High-Risk' | 'Neutral'; reasoning: string } | null> {
  try {
    const countryContext = countryName ? ` in ${countryName}` : ' in African markets'
    const prompt = `Analyze the ${sectorName} sector${countryContext} and provide:

1. Outlook: Choose one - Favorable, High-Risk, or Neutral
2. Brief reasoning (1-2 sentences)

Be concise and data-driven. Focus on current market conditions and investment attractiveness.`

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/chat/send`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('access_token')}`
      },
      body: JSON.stringify({
        message: prompt
      })
    })

    if (!response.ok) {
      console.error('Failed to generate sector outlook:', response.statusText)
      return null
    }

    const data: ZwadiResponse = await response.json()

    if (data.success && data.message) {
      // Extract outlook classification
      let outlook: 'Favorable' | 'High-Risk' | 'Neutral' = 'Neutral'

      const messageLower = data.message.toLowerCase()
      if (messageLower.includes('favorable') || messageLower.includes('positive') || messageLower.includes('strong')) {
        outlook = 'Favorable'
      } else if (messageLower.includes('high-risk') || messageLower.includes('risky') || messageLower.includes('challenging')) {
        outlook = 'High-Risk'
      }

      return {
        outlook,
        reasoning: data.message.substring(0, 200) // First 200 chars as reasoning
      }
    }

    return null
  } catch (error) {
    console.error('Error generating sector outlook:', error)
    return null
  }
}

/**
 * Batch generate sector outlooks for multiple sectors
 */
export async function batchGenerateSectorOutlooks(
  sectors: string[],
  countryName?: string
): Promise<Map<string, { outlook: 'Favorable' | 'High-Risk' | 'Neutral'; reasoning: string }>> {
  const results = new Map()

  // Generate outlooks sequentially to avoid rate limiting
  for (const sector of sectors) {
    const result = await generateSectorOutlook(sector, countryName)
    if (result) {
      results.set(sector, result)
    }
    // Small delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 1000))
  }

  return results
}

/**
 * Check if Zawadi AI is available
 */
export async function checkZwadiStatus(): Promise<boolean> {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/chat/status`)
    const data = await response.json()
    return data.success && data.available
  } catch (error) {
    console.error('Error checking Zwadi status:', error)
    return false
  }
}
