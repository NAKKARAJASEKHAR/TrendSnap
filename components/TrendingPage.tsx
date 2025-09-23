/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState, ChangeEvent, useRef } from 'react';
import { motion, AnimatePresence, type Variants } from 'framer-motion';
import PolaroidCard from './PolaroidCard';
import { cn } from '../lib/utils';
import { generateImageFromPrompt, GeminiError, GeminiErrorType } from '../services/geminiService';
import { Card3D } from './ui/Card3D';

// Mock data for trending images. In a real app, this would come from an API.
const trendingImages = [
    { id: 1, rank: 1, imageUrl: 'https://images.unsplash.com/photo-1678813337399-7a332f117c3a?q=80&w=800&auto=format&fit=crop', prompt: 'Cyberpunk warrior princess with neon katanas on a rainy Tokyo street.', generationCount: 12589 },
    { id: 2, rank: 2, imageUrl: 'https://images.unsplash.com/photo-1694605174787-347513b63155?q=80&w=800&auto=format&fit=crop', prompt: 'A golden retriever as a whimsical wizard casting a spell in an enchanted forest.', generationCount: 11982 },
    { id: 3, rank: 3, imageUrl: 'https://images.unsplash.com/photo-1681313028489-397a2fdd9041?q=80&w=800&auto=format&fit=crop', prompt: 'Impressionist painting of a bustling Parisian café at sunset.', generationCount: 11503 },
    { id: 4, rank: 4, imageUrl: 'https://images.unsplash.com/photo-1698642284993-4e4b2d13f95b?q=80&w=800&auto=format&fit=crop', prompt: 'Steampunk inventor with intricate clockwork machinery and goggles.', generationCount: 10874 },
    { id: 5, rank: 5, imageUrl: 'https://images.unsplash.com/photo-1692864603901-200615295f13?q=80&w=800&auto=format&fit=crop', prompt: 'Surreal underwater city with glowing coral skyscrapers and bioluminescent creatures.', generationCount: 10231 },
    { id: 6, rank: 6, imageUrl: 'https://images.unsplash.com/photo-1605333149959-524f7c13a6a1?q=80&w=800&auto=format&fit=crop', prompt: 'Noble elf queen with silver hair and glowing magical runes on her face.', generationCount: 9987 },
    { id: 7, rank: 7, imageUrl: 'https://images.unsplash.com/photo-1694432924430-8e1f3fe9ed83?q=80&w=800&auto=format&fit=crop', prompt: '1990s anime style hero powering up with crackling energy.', generationCount: 9642 },
    { id: 8, rank: 8, imageUrl: 'https://images.unsplash.com/photo-1617991223395-5800098f9831?q=80&w=800&auto=format&fit=crop', prompt: 'Pop-art explosion of color, comic book style.', generationCount: 9311 },
    { id: 9, rank: 9, imageUrl: 'https://images.unsplash.com/photo-1596482701116-3a5f6acb562c?q=80&w=800&auto=format&fit=crop', prompt: 'A majestic dragon perched atop a snow-covered mountain peak at dawn.', generationCount: 9005 },
    { id: 10, rank: 10, imageUrl: 'https://images.unsplash.com/photo-1620712943543-285f21639e4a?q=80&w=800&auto=format&fit=crop', prompt: 'Biomechanical android with intricate glowing circuits visible.', generationCount: 8754 },
    { id: 11, rank: 11, imageUrl: 'https://images.unsplash.com/photo-1531366936337-7c912a4589a7?q=80&w=800&auto=format&fit=crop', prompt: 'An ethereal ghost floating through a haunted, moonlit forest.', generationCount: 8521 },
    { id: 12, rank: 12, imageUrl: 'https://images.unsplash.com/photo-1688537619478-55b6183f334a?q=80&w=800&auto=format&fit=crop', prompt: 'Person as a cartoon character from a modern animated movie.', generationCount: 8233 },
    { id: 13, rank: 13, imageUrl: 'https://images.unsplash.com/photo-1679083216832-6b9a8f4c3bfc?q=80&w=800&auto=format&fit=crop', prompt: 'Robot with a soul, looking wistfully at a butterfly.', generationCount: 7988 },
    { id: 14, rank: 14, imageUrl: 'https://images.unsplash.com/photo-1518314916381-77a37c2a49ae?q=80&w=800&auto=format&fit=crop', prompt: 'Hacker in a dark room, code reflecting in their glasses.', generationCount: 7714 },
    { id: 15, rank: 15, imageUrl: 'https://images.unsplash.com/photo-1617986414991-299b9a6962f9?q=80&w=800&auto=format&fit=crop', prompt: 'Street art mural of a person\'s face, vibrant and full of life.', generationCount: 7501 },
    { id: 16, rank: 16, imageUrl: 'https://images.unsplash.com/photo-1501432377862-3d0432b87a14?q=80&w=800&auto=format&fit=crop', prompt: 'Person\'s face made of swirling galaxies and stardust.', generationCount: 7289 },
    { id: 17, rank: 17, imageUrl: 'https://images.unsplash.com/photo-1695431442089-b5a0a5531d04?q=80&w=800&auto=format&fit=crop', prompt: 'A shadowy noir detective on a foggy night.', generationCount: 7015 },
    { id: 18, rank: 18, imageUrl: 'https://images.unsplash.com/photo-1681237889162-8785f8948701?q=80&w=800&auto=format&fit=crop', prompt: 'Tribal warrior with intricate face paint and bone armor.', generationCount: 6842 },
    { id: 19, rank: 19, imageUrl: 'https://images.unsplash.com/photo-1690460456391-6674d814237d?q=80&w=800&auto=format&fit=crop', prompt: 'Living statue made of marble and gold, crying tears of liquid metal.', generationCount: 6632 },
    { id: 20, rank: 20, imageUrl: 'https://images.unsplash.com/photo-1698241318042-88f63a14b980?q=80&w=800&auto=format&fit=crop', prompt: 'Abstract human form made of fire and light.', generationCount: 6499 },
];

const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.05 } },
};

const itemVariants: Variants = {
    hidden: { y: 20, opacity: 0, scale: 0.95 },
    visible: { y: 0, opacity: 1, scale: 1, transition: { type: 'spring', stiffness: 100, damping: 12 } },
};

type GenerationStatus = 'idle' | 'pending' | 'done' | 'error';

const TrendingPage = () => {
    const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [generationResult, setGenerationResult] = useState<{ status: GenerationStatus; url?: string; error?: string; prompt?: string }>({ status: 'idle' });
    const [isGenerating, setIsGenerating] = useState(false);
    const [copiedPromptId, setCopiedPromptId] = useState<number | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const processFile = (file: File) => {
        if (file && (file.type === "image/png" || file.type === "image/jpeg" || file.type === "image/webp")) {
            const reader = new FileReader();
            reader.onloadend = () => setUploadedImageUrl(reader.result as string);
            reader.readAsDataURL(file);
        } else {
            alert("Please upload a valid image file (PNG, JPG, WEBP).");
        }
    };

    const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files?.[0]) processFile(e.target.files[0]);
    };

    const handleReupload = () => {
        fileInputRef.current?.click();
    };

    const handleDragOver = (e: React.DragEvent<HTMLLabelElement>) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent<HTMLLabelElement>) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent<HTMLLabelElement>) => {
        e.preventDefault();
        setIsDragging(false);
        if (e.dataTransfer.files?.[0]) processFile(e.dataTransfer.files[0]);
    };

    const handleCopyPrompt = (prompt: string, id: number) => {
        navigator.clipboard.writeText(prompt);
        setCopiedPromptId(id);
        setTimeout(() => setCopiedPromptId(null), 2000); // Reset after 2 seconds
    };

    const handleStyleSelect = async (prompt: string) => {
        if (!uploadedImageUrl) {
            alert("Please upload your photo first!");
            return;
        }
        if (isGenerating) return;

        setIsGenerating(true);
        setGenerationResult({ status: 'pending', prompt });

        try {
            const resultUrl = await generateImageFromPrompt(uploadedImageUrl, prompt);
            setGenerationResult({ status: 'done', url: resultUrl, prompt });
        } catch (err) {
            let friendlyErrorMessage = "Generation failed. Please try again.";
            if (err instanceof GeminiError) {
                switch (err.type) {
                    case GeminiErrorType.BLOCKED: friendlyErrorMessage = "Blocked for safety. Try a different prompt/photo."; break;
                    case GeminiErrorType.RATE_LIMIT: friendlyErrorMessage = "Too many requests. Please wait a moment."; break;
                    case GeminiErrorType.SERVER_ERROR: friendlyErrorMessage = "The AI model is busy. Please try again."; break;
                    default: friendlyErrorMessage = "An unexpected error occurred."; break;
                }
            }
            setGenerationResult({ status: 'error', error: friendlyErrorMessage, prompt });
        } finally {
            setIsGenerating(false);
        }
    };

    const handleCloseModal = () => setGenerationResult({ status: 'idle' });
    
    const handleDownload = () => {
        if (generationResult.status === 'done' && generationResult.url) {
            const link = document.createElement('a');
            link.href = generationResult.url;
            const filename = (generationResult.prompt?.substring(0, 30) || 'creation').replace(/[^a-z0-9]/gi, '_').toLowerCase();
            link.download = `past-forward-trending-${filename}.jpg`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    };

    const filteredImages = trendingImages.filter(image =>
        image.prompt.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <>
            <input ref={fileInputRef} id="trending-file-upload" type="file" className="hidden" accept="image/png, image/jpeg, image/webp" onChange={handleImageUpload} />
            
            <div className="z-10 w-full h-full p-4 md:p-8 overflow-y-auto">
                <motion.div className="max-w-7xl mx-auto" initial="hidden" animate="visible" variants={containerVariants}>
                    <motion.div className="text-center mb-8" variants={itemVariants}>
                        <h2 className="text-5xl md:text-8xl font-caveat font-bold text-neutral-100">Trending Now</h2>
                        <p className="font-permanent-marker text-neutral-300 mt-4 text-xl tracking-wide">Remix a popular style with your own photo.</p>
                    </motion.div>

                    <motion.div variants={itemVariants} className="mb-12">
                        {!uploadedImageUrl ? (
                            <div className="flex flex-col items-center">
                                <p className="text-center font-permanent-marker text-yellow-400 text-2xl mb-4">Step 1: Upload Your Photo</p>
                                <label
                                    htmlFor="trending-file-upload"
                                    onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop}
                                    className={cn("cursor-pointer group p-8 border-2 border-dashed rounded-lg transition-all duration-300", isDragging ? "border-yellow-400 bg-yellow-400/10 scale-105" : "border-neutral-700 hover:border-neutral-500")}
                                >
                                    <div className="transform group-hover:scale-105 transition-transform duration-300 pointer-events-none">
                                        <PolaroidCard caption="Upload a Photo" status="done" />
                                    </div>
                                </label>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center gap-4">
                                <p className="text-center font-permanent-marker text-yellow-400 text-2xl">Step 2: Select a Style Below</p>
                                <PolaroidCard imageUrl={uploadedImageUrl} caption="Your Photo" status="done" onReupload={handleReupload} />
                            </div>
                        )}
                    </motion.div>

                    <motion.div className="mb-12" variants={itemVariants}>
                        <div className="relative max-w-lg mx-auto">
                            <input type="text" placeholder="Search prompts (e.g., 'Cyberpunk', 'Dragon')..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full p-3 pl-10 bg-neutral-900 border-2 border-neutral-700 rounded-md text-neutral-200 placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-colors" />
                            <svg className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                        </div>
                    </motion.div>

                    <motion.div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6" variants={containerVariants}>
                        {filteredImages.length > 0 ? (
                            filteredImages.map((image) => (
                                <Card3D
                                    key={image.id}
                                    className={cn("group aspect-w-1 aspect-h-1", isGenerating ? "cursor-not-allowed" : "cursor-pointer")}
                                    variants={itemVariants}
                                    onClick={!isGenerating ? () => handleStyleSelect(image.prompt) : undefined}
                                >
                                    <img src={image.imageUrl} alt={image.prompt} className="w-full h-full object-cover" loading="lazy" />
                                    <div className="absolute inset-0 bg-black/70 p-4 flex flex-col justify-between text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                        <div className="flex justify-end">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleCopyPrompt(image.prompt, image.id);
                                                }}
                                                className="p-2 bg-black/50 rounded-full text-white hover:bg-black/75 focus:outline-none focus:ring-2 focus:ring-white transition-all"
                                                aria-label="Copy prompt"
                                            >
                                                {copiedPromptId === image.id ? (
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                                    </svg>
                                                ) : (
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                                    </svg>
                                                )}
                                            </button>
                                        </div>
                                        <p className="text-xs text-yellow-400 font-bold self-end">{image.generationCount.toLocaleString()} Generations</p>
                                    </div>
                                </Card3D>
                            ))
                        ) : (
                            <motion.div className="text-center py-12 col-span-full" variants={itemVariants}>
                                <p className="text-neutral-500 font-permanent-marker text-xl">No results found.</p>
                            </motion.div>
                        )}
                    </motion.div>
                </motion.div>
            </div>

            <AnimatePresence>
                {generationResult.status !== 'idle' && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4"
                        onClick={handleCloseModal}
                    >
                        <motion.div
                            initial={{ y: 50, scale: 0.95 }} animate={{ y: 0, scale: 1 }} exit={{ y: 50, scale: 0.95 }}
                            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                            className="bg-neutral-900 border border-neutral-700 rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-2xl font-permanent-marker text-yellow-400">Generation Result</h3>
                                <button onClick={handleCloseModal} className="text-neutral-500 hover:text-white text-3xl">&times;</button>
                            </div>
                            <div className="flex flex-col md:flex-row gap-8 items-center justify-center">
                                <PolaroidCard imageUrl={uploadedImageUrl!} caption="Your Photo" status="done" />
                                <PolaroidCard
                                    caption={generationResult.prompt?.substring(0, 25) + '...' || "Remixed"}
                                    status={generationResult.status}
                                    imageUrl={generationResult.url}
                                    error={generationResult.error}
                                    onDownload={handleDownload}
                                />
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

export default TrendingPage;