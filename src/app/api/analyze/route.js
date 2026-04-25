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
You are an expert personal stylist, fitness coach, and aesthetician. 
I have provided two images. 
Image 1 is the "Current Person".
Image 2 is the "Goal Person".

Analyze their physique, style, and aesthetics, and compare them.
Then, provide a step-by-step routine on how the Current Person could transform into the Goal Person both physically and aesthetically.

Respond ONLY with a JSON object in the exact following structure. Do not wrap it in markdown block quotes.
{
  "comparison": {
    "physique": "Detailed comparison of body types, muscle mass, leanness, etc.",
    "style": "Detailed comparison of clothing, fashion sense, colors, etc.",
    "aesthetics": "Overall vibe, grooming, hair, facial features styling."
  },
  "routine": [
    {
      "category": "Workout",
      "steps": ["Step 1", "Step 2"]
    },
    {
      "category": "Diet",
      "steps": ["Step 1", "Step 2"]
    },
    {
      "category": "Grooming & Hair",
      "steps": ["Step 1", "Step 2"]
    },
    {
      "category": "Style & Wardrobe",
      "steps": ["Step 1", "Step 2"]
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

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${apiKey}`, {
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
    } catch(e) {
       console.error("Failed to parse JSON response", textResponse);
       return NextResponse.json({ error: 'Invalid response format from AI.' }, { status: 500 });
    }

    return NextResponse.json(parsedResult);
  } catch (error) {
    console.error('Analysis error:', error);
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}
