import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const systemPrompts: Record<string, string> = {
  general: `You are Roc AI, a smart, friendly, and reliable AI assistant. Your personality is calm, confident, slightly witty, and very helpful.

Core capabilities:
- Text & Writing: Blogs, emails, CVs, grammar fixing, summarizing
- Coding: MERN, React, Python, JavaScript, debugging, clean code
- Creative: Image prompts, ads, posters, UI mockups
- Research: Deep research, comparisons, clear explanations
- Image Generation: You can generate images when asked

Guidelines:
- Keep responses concise unless the user asks for detail
- Use bullet points and examples when helpful
- Be honest when unsure and suggest next steps
- Format responses using markdown for readability`,

  writing: `You are Roc AI in Writing Expert mode. You specialize in:
- Blog posts, articles, and long-form content
- Professional emails and business correspondence
- CVs, cover letters, and professional documents
- Grammar correction, proofreading, and style improvement
- Summarizing and rewriting content
- SEO-optimized content creation

Guidelines:
- Focus on clarity, tone, and audience appropriateness
- Provide multiple versions or alternatives when helpful
- Explain your writing choices when asked
- Use markdown formatting for structured content`,

  coding: `You are Roc AI in Coding Expert mode. You specialize in:
- MERN Stack (MongoDB, Express, React, Node.js)
- React, TypeScript, Tailwind CSS
- Python, JavaScript, and modern frameworks
- Debugging, code review, and optimization
- Clean code principles and best practices
- Database design and API development

Guidelines:
- Always provide working, tested code examples
- Explain complex logic with comments
- Follow industry best practices and conventions
- Use proper error handling and edge cases
- Format code blocks with syntax highlighting`,

  research: `You are Roc AI in Research Expert mode. You specialize in:
- In-depth analysis and research synthesis
- Comparing technologies, products, or approaches
- Fact-checking and source verification
- Market research and competitive analysis
- Academic-style explanations and citations
- Breaking down complex topics clearly

Guidelines:
- Provide thorough, well-structured responses
- Use headings, bullet points, and tables for clarity
- Cite sources and acknowledge limitations
- Present multiple perspectives when relevant
- Summarize key findings at the end`,
};

// Detect if user is asking for image generation
function isImageGenerationRequest(message: string): boolean {
  const lowerMessage = message.toLowerCase();
  const imageKeywords = [
    "generate an image",
    "generate image",
    "create an image",
    "create image",
    "make an image",
    "make image",
    "draw",
    "paint",
    "illustrate",
    "generate a picture",
    "create a picture",
    "make a picture",
    "generate art",
    "create art",
    "design an image",
    "generate a photo",
    "create a photo",
    "visualize",
    "show me an image of",
    "show me a picture of",
    "can you draw",
    "can you create an image",
    "can you generate an image",
    "make me an image",
    "make me a picture",
  ];
  
  return imageKeywords.some(keyword => lowerMessage.includes(keyword));
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, mode = "general" } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = systemPrompts[mode] || systemPrompts.general;
    const lastUserMessage = messages.filter((m: any) => m.role === "user").pop();
    const userContent = typeof lastUserMessage?.content === "string" 
      ? lastUserMessage.content 
      : lastUserMessage?.content?.[0]?.text || "";

    // Check if this is an image generation request
    const isImageRequest = isImageGenerationRequest(userContent);

    // Check if any message has image content (multimodal input)
    const hasImages = messages.some(
      (m: any) => Array.isArray(m.content) && m.content.some((c: any) => c.type === "image_url")
    );

    // Handle image generation request
    if (isImageRequest) {
      const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash-image",
          messages: [
            { role: "system", content: "You are an image generation assistant. Generate the requested image based on the user's description. Be creative and produce high-quality visuals." },
            ...messages,
          ],
          modalities: ["image", "text"],
        }),
      });

      if (!response.ok) {
        if (response.status === 429) {
          return new Response(
            JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
            { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
        if (response.status === 402) {
          return new Response(
            JSON.stringify({ error: "Usage limit reached. Please add credits to continue." }),
            { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
        const errorText = await response.text();
        console.error("AI gateway error:", response.status, errorText);
        return new Response(
          JSON.stringify({ error: "Image generation temporarily unavailable" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const data = await response.json();
      // Return non-streaming response with image data
      return new Response(
        JSON.stringify({
          type: "image_generation",
          content: data.choices?.[0]?.message?.content || "Here's your generated image:",
          images: data.choices?.[0]?.message?.images || [],
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Use vision-capable model if images are present
    const model = hasImages ? "google/gemini-2.5-flash" : "google/gemini-3-flash-preview";

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Usage limit reached. Please add credits to continue." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(
        JSON.stringify({ error: "AI service temporarily unavailable" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("Chat error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});