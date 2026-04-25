import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const formData = await req.formData();
    const image1 = formData.get('image1');
    const image2 = formData.get('image2');

    if (!image1 || !image2) {
      return NextResponse.json({ error: 'Both images are required.' }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'Gemini API key is not configured in .env.local' }, { status: 500 });
    }

    // Convert File to base64
    const buffer1 = await image1.arrayBuffer();
    const base64_1 = Buffer.from(buffer1).toString('base64');
    const mime1 = image1.type;

    const buffer2 = await image2.arrayBuffer();
    const base64_2 = Buffer.from(buffer2).toString('base64');
    const mime2 = image2.type;

    const promptText = `
You are an objective, highly observant visual transformation assistant. Your task is to perform a strict "spot the difference" analysis between "Personal Images" (current state) and "Goal Images" (desired state), and provide clear, practical steps to transition between them.

CRITICAL INSTRUCTIONS:
1. Balanced Detail & Layman-Friendly Language: Your \`action_steps\` should read like a helpful, easy-to-understand "how-to" guide. Provide enough practical context so the user knows exactly what to do, but avoid extreme medical, anatomical, or scientific jargon. Assume basic common sense (e.g., do not explain how to unbutton a shirt or what socks are).
2. The "Sidebar" Variables Strategy: Use the \`action_variables\` array strictly for quick-reference metrics, tools, estimated costs, or timeframes (e.g., "Frequency: 3x a week", "Required Tool: Dumbbells", "Haircut Style: Skin Fade"). This data is meant for a UI table.
3. STRICT ANTI-REDUNDANCY RULE: Do not repeat obvious information between the steps and the variables. If an action step is "Visit a local barber," do NOT create an action variable that says "Location: Barber shop". Variables must add measurable or categorical value, not just repeat the step in a different format.
4. Literal Visual Comparison: You must identify literal visual differences (clothing, physique, hair, lighting, accessories) rather than just summarizing the overall identity.
5. Objectivity is Mandatory: Provide the steps to reach the goal regardless of whether the change is an "upgrade" or "downgrade". 
6. Output Format: You must respond ONLY with a valid, perfectly formatted JSON object. Do not include markdown formatting (like \`\`\`json) or conversational text.

JSON SCHEMA REQUIREMENT:
You must strictly adhere to the following JSON structure:
{
  "category_of_change": "A short description of the primary domain of change (e.g., 'Physique & Styling').",
  "how_to_change_rate": "Estimation of speed/intensity (e.g., 'Immediate', '6 Months of consistent diet').",
  "detailed_changes": [
    {
      "change_header": "Specific visual element changing (e.g., 'Upper Body Clothing', 'Shoulder Muscle', 'Facial Hair').",
      "current_state": "Concise description of the current state.",
      "target_state": "Concise description of the target state.",
      "action_steps": [
        "Step 1: A readable, layman-friendly instruction providing the necessary context.",
        "Step 2: The next logical instruction."
      ],
      "action_variables": [
        {
          "variable_name": "A context-specific metric, tool, or spec (e.g., 'Required Tool', 'Target Color', 'Frequency').",
          "variable_value": "The specific value (e.g., 'Clippers', 'Black', 'Twice a week')."
        }
      ]
    }
  ]
}
`;

    const requestBody = {
      contents: [
        {
          parts: [
            { text: promptText },
            {
              inline_data: {
                mime_type: mime1,
                data: base64_1
              }
            },
            {
              inline_data: {
                mime_type: mime2,
                data: base64_2
              }
            }
          ]
        }
      ],
      generationConfig: {
        responseMimeType: "application/json"
      }
    };

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Gemini API Error:', errorData);
      return NextResponse.json({ error: 'Failed to analyze images.' }, { status: response.status });
    }

    const data = await response.json();
    const textResponse = data.candidates[0].content.parts[0].text;

    // Parse the JSON safely
    let parsedResult;
    try {
      parsedResult = JSON.parse(textResponse);
    } catch (e) {
      console.error("Failed to parse JSON response", textResponse);
      return NextResponse.json({ error: 'Invalid response format from AI.' }, { status: 500 });
    }

    return NextResponse.json(parsedResult);
  } catch (error) {
    console.error('Analysis error:', error);
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}
