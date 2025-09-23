/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState, ChangeEvent, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { generateImageFromPrompt, GeminiError, GeminiErrorType } from '../services/geminiService';
import PolaroidCard from './PolaroidCard';
import { cn } from '../lib/utils';

const primaryButtonClasses = "font-permanent-marker text-xl text-center text-black bg-yellow-400 py-3 px-8 rounded-sm transform transition-transform duration-200 hover:scale-105 hover:-rotate-2 hover:bg-yellow-300 shadow-[2px_2px_0px_2px_rgba(0,0,0,0.2)] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:hover:bg-yellow-400";
const secondaryButtonClasses = "font-permanent-marker text-xl text-center text-white bg-white/10 backdrop-blur-sm border-2 border-white/80 py-3 px-8 rounded-sm transform transition-transform duration-200 hover:scale-105 hover:rotate-2 hover:bg-white hover:text-black";

const INSPIRING_PROMPTS = [
    "Turn this person into a vibrant, pop-art character inspired by Andy Warhol, with bold colors and repeating patterns.",
    "Reimagine this person as a noble knight in shining, ornate armor, standing in a misty, fantasy castle courtyard.",
    "Create a version of this person in the style of a classic anime from the 1990s, with large expressive eyes and dynamic hair.",
    "Place this person in a surreal, dream-like landscape with floating islands, glowing flora, and two moons in the sky.",
    "Transform this person into a gritty cyberpunk character with neon-lit cybernetic enhancements and futuristic clothing on a rainy city street.",
    "Illustrate this person as the main character in a children's storybook, with a soft, whimsical, and friendly art style."
];

type ImageGenerationStatus = 'idle' | 'pending' | 'done' | 'error';

interface CreatePageProps {
    initialPrompt?: string;
}

const CreatePage: React.FC<CreatePageProps> = ({ initialPrompt = '' }) => {
    const [uploadedImage, setUploadedImage] = useState<string | null>(null);
    const [prompt, setPrompt] = useState(initialPrompt);
    const [generatedResult, setGeneratedResult] = useState<{ status: ImageGenerationStatus; url?: string; error?: string; }>({ status: 'idle' });
    const [isLoading, setIsLoading] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        // If an initial prompt is passed from another page, update the state
        if (initialPrompt) {
            setPrompt(initialPrompt);
        }
    }, [initialPrompt]);

    const processFile = (file: File) => {
        if (file && (file.type === "image/png" || file.type === "image/jpeg" || file.type === "image/webp")) {
             const reader = new FileReader();
            reader.onloadend = () => {
                setUploadedImage(reader.result as string);
                setGeneratedResult({ status: 'idle' });
            };
            reader.readAsDataURL(file);
        } else {
            console.error("Invalid file type.");
            alert("Please upload a valid image file (PNG, JPG, WEBP).");
        }
    };

    const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            processFile(e.target.files[0]);
        }
    };

     const handleReupload = () => {
        fileInputRef.current?.click();
    };

     const handleDragOver = (e: React.DragEvent<HTMLLabelElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent<HTMLLabelElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent<HTMLLabelElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            processFile(e.dataTransfer.files[0]);
        }
    };

    const handleInspireMe = () => {
        const randomPrompt = INSPIRING_PROMPTS[Math.floor(Math.random() * INSPIRING_PROMPTS.length)];
        setPrompt(randomPrompt);
    };

    const handleGenerate = async () => {
        if (!uploadedImage || !prompt.trim() || isLoading) return;

        setIsLoading(true);
        setGeneratedResult({ status: 'pending' });

        try {
            const resultUrl = await generateImageFromPrompt(uploadedImage, prompt);
            setGeneratedResult({ status: 'done', url: resultUrl });
        } catch (err) {
            let friendlyErrorMessage = "Generation failed. Please try again.";
            if (err instanceof GeminiError) {
                switch (err.type) {
                    case GeminiErrorType.BLOCKED:
                        friendlyErrorMessage = "Blocked for safety reasons. Try a different prompt or photo.";
                        break;
                    case GeminiErrorType.RATE_LIMIT:
                        friendlyErrorMessage = "Too many requests. Please wait a moment.";
                        break;
                    case GeminiErrorType.SERVER_ERROR:
                         friendlyErrorMessage = "The AI model is busy. Please try again.";
                         break;
                    default:
                        friendlyErrorMessage = "An unexpected error occurred.";
                        break;
                }
            }
            setGeneratedResult({ status: 'error', error: friendlyErrorMessage });
            console.error('Failed to generate image:', err);
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleReset = () => {
        setUploadedImage(null);
        setPrompt(initialPrompt || ''); // Reset to initial or empty
        setGeneratedResult({ status: 'idle' });
        setIsLoading(false);
    };

    const handleDownload = () => {
        if (generatedResult.status === 'done' && generatedResult.url) {
            const link = document.createElement('a');
            link.href = generatedResult.url;
            // Sanitize prompt for filename
            const filename = (prompt.substring(0, 30) || 'creation').replace(/[^a-z0-9]/gi, '_').toLowerCase();
            link.download = `past-forward-creation-${filename}.jpg`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    };

    return (
        <div className="z-10 flex flex-col items-center justify-start w-full h-full flex-1 min-h-0 p-4 overflow-y-auto">
            <input ref={fileInputRef} id="create-file-upload" type="file" className="hidden" accept="image/png, image/jpeg, image/webp" onChange={handleImageUpload} />

            <div className="text-center mb-10 w-full">
                <h1 className="text-5xl md:text-8xl font-caveat font-bold text-neutral-100">Artify Yourself</h1>
                <p className="font-permanent-marker text-neutral-300 mt-2 text-xl tracking-wide">
                    Create a new reality with your photo.
                </p>
            </div>

            <div className="w-full max-w-5xl flex flex-col items-center space-y-8">
                {/* --- STEP 1: UPLOAD & RESULTS --- */}
                <div className="w-full flex flex-col items-center">
                    <p className="font-permanent-marker text-yellow-400 text-2xl mb-4">
                        Step 1: Upload Your Photo
                    </p>
                    <div className="flex flex-col md:flex-row gap-4 md:gap-8 items-center justify-center">
                        {!uploadedImage ? (
                             <label 
                                htmlFor="create-file-upload" 
                                onDragOver={handleDragOver}
                                onDragLeave={handleDragLeave}
                                onDrop={handleDrop}
                                className={cn(
                                    "cursor-pointer group p-8 border-2 border-dashed rounded-lg transition-all duration-300",
                                    isDragging ? "border-yellow-400 bg-yellow-400/10 scale-105" : "border-neutral-700 hover:border-neutral-500"
                                )}
                            >
                                <motion.div 
                                    className="transform group-hover:scale-105 transition-transform duration-300 pointer-events-none"
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ duration: 0.5, type: 'spring' }}
                                >
                                    <PolaroidCard 
                                        caption="Upload Photo"
                                        status="done"
                                    />
                                </motion.div>
                            </label>
                        ) : (
                             <PolaroidCard
                                imageUrl={uploadedImage}
                                caption="Your Photo"
                                status="done"
                                onReupload={handleReupload}
                            />
                        )}
                        
                        {(uploadedImage && (generatedResult.status !== 'idle')) && (
                            <PolaroidCard
                                caption={prompt.substring(0, 25) + (prompt.length > 25 ? '...' : '') || 'Your Creation'}
                                status={generatedResult.status}
                                imageUrl={generatedResult.url}
                                error={generatedResult.error}
                                onDownload={handleDownload}
                            />
                        )}
                    </div>
                </div>

                {/* --- STEP 2: PROMPT & GENERATE --- */}
                <div className="w-full max-w-xl flex flex-col gap-4 items-center">
                    <p className="font-permanent-marker text-yellow-400 text-2xl mb-2">
                        Step 2: Write a Prompt
                    </p>
                    <textarea
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder="Describe the image you want to create... e.g., 'A photo of the person as a space explorer on a red planet.'"
                        className="w-full h-24 p-3 bg-neutral-900 border-2 border-neutral-700 rounded-md text-neutral-200 placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-colors"
                        aria-label="Image generation prompt"
                    />
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <button onClick={handleInspireMe} className={secondaryButtonClasses} style={{fontSize: '1rem', padding: '0.75rem 1.5rem'}}>
                            Inspire Me
                        </button>
                        <button 
                            onClick={handleGenerate} 
                            disabled={!uploadedImage || !prompt.trim() || isLoading} 
                            className={primaryButtonClasses}
                        >
                            {isLoading ? 'Generating...' : 'Generate'}
                        </button>
                    </div>
                </div>

                {uploadedImage && (
                    <button onClick={handleReset} className={`${secondaryButtonClasses} mt-4`}>
                        Start Over
                    </button>
                )}
            </div>
        </div>
    );
};

export default CreatePage;
