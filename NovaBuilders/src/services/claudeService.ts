import axios from 'axios';
import {Division, DEFAULT_DIVISIONS, COST_PER_SF} from '../utils/types';

const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages';
const MODEL = 'claude-sonnet-4-20250514';

// Set your Anthropic API key in .env:  ANTHROPIC_API_KEY=sk-ant-...
const API_KEY = process.env.ANTHROPIC_API_KEY || '';

interface AnalysisResult {
  squareFeet: number;
  projectType: string;
  divisions: Division[];
  notes: string;
  confidence: 'high' | 'medium' | 'low';
}

/**
 * Analyze architectural plans using Claude vision API.
 * Accepts a base64-encoded PDF/image of the plans.
 */
export async function analyzePlans(
  base64Data: string,
  mediaType: 'application/pdf' | 'image/png' | 'image/jpeg',
  projectDescription: string,
): Promise<AnalysisResult> {
  const systemPrompt = `You are an expert general contractor estimator for Nova Builders in Utah. 
Analyze architectural plans and extract construction details to generate accurate cost estimates.
Always respond in valid JSON only — no markdown, no preamble.`;

  const userPrompt = `Analyze these architectural plans and return a JSON object with these exact fields:
{
  "squareFeet": <number — total construction area>,
  "projectType": <string — one of: Garage Addition, Home Addition, Kitchen Remodel, ADU, Full Renovation, Custom Build, Bathroom Remodel, Basement Finish, Deck/Patio, Commercial Buildout>,
  "includedDivisions": <array of division IDs to include from: demo, found, frame, roof, ext, doors, deck, insul, elec, plumb, drive, mgmt>,
  "divisionCosts": {
    "demo": <direct cost in USD>,
    "found": <direct cost>,
    "frame": <direct cost>,
    "roof": <direct cost>,
    "ext": <direct cost>,
    "doors": <direct cost>,
    "deck": <direct cost or 0>,
    "insul": <direct cost>,
    "elec": <direct cost>,
    "plumb": <direct cost>,
    "drive": <direct cost or 0>,
    "mgmt": <direct cost>
  },
  "notes": <string — key observations from the plans: materials, special conditions, scope>,
  "confidence": <"high" | "medium" | "low">
}

Base costs on 2026 Utah / Salt Lake Valley market rates. 
Project description: ${projectDescription}`;

  const response = await axios.post(
    ANTHROPIC_API_URL,
    {
      model: MODEL,
      max_tokens: 1024,
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'document',
              source: {type: 'base64', media_type: mediaType, data: base64Data},
            },
            {type: 'text', text: userPrompt},
          ],
        },
      ],
    },
    {
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': API_KEY,
        'anthropic-version': '2023-06-01',
        'anthropic-beta': 'pdfs-2024-09-25',
      },
    },
  );

  const text = response.data.content[0].text;
  const parsed = JSON.parse(text.replace(/```json|```/g, '').trim());

  // Build Division objects
  const divisions: Division[] = DEFAULT_DIVISIONS.map(div => ({
    ...div,
    directCost: parsed.divisionCosts[div.id] ?? 0,
    included: parsed.includedDivisions.includes(div.id),
  }));

  return {
    squareFeet: parsed.squareFeet,
    projectType: parsed.projectType,
    divisions,
    notes: parsed.notes,
    confidence: parsed.confidence,
  };
}

/**
 * Fallback: estimate costs from SF when no plans are uploaded.
 */
export function estimateFromSF(
  squareFeet: number,
  projectType: string,
): Division[] {
  return DEFAULT_DIVISIONS.map(div => ({
    ...div,
    directCost: Math.round(squareFeet * (COST_PER_SF[div.id] ?? 0)),
  }));
}

/**
 * Generate a professional bid email body using Claude.
 */
export async function generateBidEmail(params: {
  clientName: string;
  projectAddress: string;
  projectType: string;
  grandTotal: number;
  bidNumber: string;
}): Promise<string> {
  const response = await axios.post(
    ANTHROPIC_API_URL,
    {
      model: MODEL,
      max_tokens: 500,
      messages: [
        {
          role: 'user',
          content: `Write a brief, professional email from Nova Builders (Isai Tapia, Project Manager, 801-918-1236) sending a construction bid to ${params.clientName} for their ${params.projectType} project at ${params.projectAddress}. Total bid: $${params.grandTotal.toLocaleString()}. Bid number: ${params.bidNumber}. Keep it warm, professional, and under 150 words. No subject line needed.`,
        },
      ],
    },
    {
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': API_KEY,
        'anthropic-version': '2023-06-01',
      },
    },
  );
  return response.data.content[0].text;
}
