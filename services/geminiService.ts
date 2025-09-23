/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
// FIX: Added Modality to imports for use in image generation config.
import { GoogleGenAI, Modality } from "@google/genai";
import type { GenerateContentResponse } from "@google/genai";

// FIX: Per coding guidelines, use process.env.API_KEY directly for initialization
// and remove the vite-specific environment variable handling to resolve type errors.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });


// --- Custom Error Types ---

export enum GeminiErrorType {
    BLOCKED,
    RATE_LIMIT,
    SERVER_ERROR,
    UNKNOWN,
}

export class GeminiError extends Error {
    constructor(message: string, public type: GeminiErrorType) {
        super(message);
        this.name = 'GeminiError';
    }
}


// --- Helper Functions ---

/**
 * Creates a fallback prompt to use when the primary one is blocked.
 * @param decade The decade string (e.g., "1950s").
 * @returns The fallback prompt string.
 */
function getFallbackPrompt(decade: string): string {
    return `Create a photograph of the person in this image as if they were living in the ${decade}. The photograph should capture the distinct fashion, hairstyles, and overall atmosphere of that time period. Ensure the final image is a clear photograph that looks authentic to the era.`;
}

/**
 * Extracts the decade (e.g., "1950s") from a prompt string.
 * @param prompt The original prompt.
 * @returns The decade string or null if not found.
 */
function extractDecade(prompt: string): string | null {
    const match = prompt.match(/(\d{4}s)/);
    return match ? match[1] : null;
}

/**
 * Processes the Gemini API response, extracting the image or throwing a typed error if issues are found.
 * @param response The response from the generateContent call.
 * @returns A data URL string for the generated image.
 */
function processGeminiResponse(response: GenerateContentResponse): string {
    // Check for safety blocks first in the response feedback
    if (response.promptFeedback?.blockReason === 'SAFETY' || response.candidates?.[0]?.finishReason === 'SAFETY') {
        console.warn("Request was blocked for safety reasons.");
        throw new GeminiError("The prompt or image was blocked due to safety policies.", GeminiErrorType.BLOCKED);
    }

    const imagePartFromResponse = response.candidates?.[0]?.content?.parts?.find(part => part.inlineData);

    if (imagePartFromResponse?.inlineData) {
        const { mimeType, data } = imagePartFromResponse.inlineData;
        return `data:${mimeType};base64,${data}`;
    }

    // This case often indicates a content block where the model replies with text instead of an image.
    const textResponse = response.text;
    console.error("API did not return an image. This might indicate a content block. Response:", textResponse);
    throw new GeminiError("The AI model responded with text instead of an image, which may indicate a content policy issue.", GeminiErrorType.BLOCKED);
}


/**
 * A wrapper for the Gemini API call that includes a retry mechanism for internal server errors.
 * @param imagePart The image part of the request payload.
 * @param textPart The text part of the request payload.
 * @returns The GenerateContentResponse from the API.
 */
async function callGeminiWithRetry(imagePart: object, textPart: object): Promise<GenerateContentResponse> {
    const maxRetries = 3;
    const initialDelay = 1000;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            // FIX: Added required 'config' with 'responseModalities' for the image editing model per guidelines.
            return await ai.models.generateContent({
                model: 'gemini-2.5-flash-image-preview',
                contents: { parts: [imagePart, textPart] },
                config: {
                    responseModalities: [Modality.IMAGE, Modality.TEXT],
                },
            });
        } catch (error) {
            console.error(`Error calling Gemini API (Attempt ${attempt}/${maxRetries}):`, error);
            const errorMessage = error instanceof Error ? error.message : JSON.stringify(error);

            // Check for rate limiting
            if (errorMessage.includes('429')) {
                throw new GeminiError("You are making too many requests. Please wait and try again later.", GeminiErrorType.RATE_LIMIT);
            }

            // Check for retriable internal server errors (500, 503, etc.)
            const isInternalError = errorMessage.includes('500') || errorMessage.includes('INTERNAL') || errorMessage.includes('503');

            if (isInternalError && attempt < maxRetries) {
                const delay = initialDelay * Math.pow(2, attempt - 1);
                console.log(`Internal error detected. Retrying in ${delay}ms...`);
                await new Promise(resolve => setTimeout(resolve, delay));
                continue;
            }
            
            if (isInternalError) {
                 throw new GeminiError("The AI model service is currently unavailable. Please try again later.", GeminiErrorType.SERVER_ERROR);
            }
            
            throw new GeminiError(`An unknown API error occurred: ${errorMessage}`, GeminiErrorType.UNKNOWN);
        }
    }
    throw new GeminiError("Gemini API call failed after all retries.", GeminiErrorType.SERVER_ERROR);
}


/**
 * Generates an image from a source image and a custom user prompt.
 * @param imageDataUrl A data URL string of the source image.
 * @param prompt The custom prompt to guide the image generation.
 * @returns A promise that resolves to a base64-encoded image data URL.
 */
export async function generateImageFromPrompt(imageDataUrl: string, prompt: string): Promise<string> {
    const match = imageDataUrl.match(/^data:(image\/\w+);base64,(.*)$/);
    if (!match) {
        throw new Error("Invalid image data URL format. Expected 'data:image/...;base64,...'");
    }
    const [, mimeType, base64Data] = match;

    const imagePart = {
        inlineData: { mimeType, data: base64Data },
    };

    const textPart = { text: prompt };

    try {
        console.log("Attempting generation with custom prompt...");
        const response = await callGeminiWithRetry(imagePart, textPart);
        return processGeminiResponse(response);
    } catch (error) {
        console.error("An unrecoverable error occurred during custom image generation.", error);
        throw error; // Re-throw the original (potentially custom GeminiError) error
    }
}


/**
 * Generates a decade-styled image from a source image and a prompt.
 * It includes a fallback mechanism for prompts that might be blocked.
 * @param imageDataUrl A data URL string of the source image.
 * @param prompt The prompt to guide the image generation.
 * @returns A promise that resolves to a base64-encoded image data URL of the generated image.
 */
export async function generateDecadeImage(imageDataUrl: string, prompt: string): Promise<string> {
  const match = imageDataUrl.match(/^data:(image\/\w+);base64,(.*)$/);
  if (!match) {
    throw new Error("Invalid image data URL format. Expected 'data:image/...;base64,...'");
  }
  const [, mimeType, base64Data] = match;

    const imagePart = {
        inlineData: { mimeType, data: base64Data },
    };

    // --- First attempt with the original prompt ---
    try {
        console.log("Attempting generation with original prompt...");
        const textPart = { text: prompt };
        const response = await callGeminiWithRetry(imagePart, textPart);
        return processGeminiResponse(response);
    } catch (error) {
        // If it's a BLOCKED error, we try the fallback.
        if (error instanceof GeminiError && error.type === GeminiErrorType.BLOCKED) {
            console.warn("Original prompt was blocked. Trying a fallback prompt.");
            const decade = extractDecade(prompt);
            if (!decade) {
                console.error("Could not extract decade from prompt, cannot use fallback.");
                throw error; // Re-throw the original block error.
            }

            // --- Second attempt with the fallback prompt ---
            try {
                const fallbackPrompt = getFallbackPrompt(decade);
                console.log(`Attempting generation with fallback prompt for ${decade}...`);
                const fallbackTextPart = { text: fallbackPrompt };
                const fallbackResponse = await callGeminiWithRetry(imagePart, fallbackTextPart);
                return processGeminiResponse(fallbackResponse);
            } catch (fallbackError) {
                console.error("Fallback prompt also failed.", fallbackError);
                throw fallbackError; // Throw the second error, as it's the most recent failure.
            }
        } else {
            // This is for other errors (rate limit, server error, etc.)
            console.error("An unrecoverable, non-block error occurred during image generation.", error);
            throw error;
        }
    }
}
