/**
 * Utility functions for HTML content processing
 */

/**
 * Cleans HTML content to plain text with proper formatting
 * @param htmlContent - The HTML content to clean
 * @returns Clean plain text with proper spacing and line breaks
 */
export const cleanHtmlContent = (htmlContent: string): string => {
    try {
        if (!htmlContent || typeof htmlContent !== 'string') {
            console.warn('⚠️ Invalid HTML content provided');
            return '';
        }

        console.log('🧹 Raw HTML content:', htmlContent);

        // Clean HTML content to plain text with proper spacing
        let cleaned = htmlContent
            .replace(/<p[^>]*>/g, '\n') // Replace <p> tags with line breaks
            .replace(/<\/p>/g, '') // Remove closing </p> tags
            .replace(/<br[^>]*>/g, '\n') // Replace <br> tags with line breaks
            .replace(/<[^>]*>/g, '') // Remove any remaining HTML tags
            .replace(/&nbsp;/g, ' ') // Replace &nbsp; with spaces
            .replace(/&amp;/g, '&') // Replace &amp; with &
            .replace(/&lt;/g, '<') // Replace &lt; with <
            .replace(/&gt;/g, '>') // Replace &gt; with >
            .replace(/&quot;/g, '"') // Replace &quot; with "
            .replace(/&#39;/g, "'") // Replace &#39; with '
            .replace(/\n\s*\n\s*\n/g, '\n\n') // Replace multiple line breaks with double line breaks
            .replace(/^\s+|\s+$/g, '') // Trim start and end
            .replace(/[ \t]+/g, ' '); // Replace multiple spaces/tabs with single space (but preserve line breaks)

        console.log('🧹 HTML cleaning:', {
            original: htmlContent,
            cleaned: cleaned
        });

        return cleaned;
    } catch (error) {
        console.error('❌ Error cleaning HTML content:', error);
        return htmlContent || ''; // Return original content if cleaning fails
    }
};

/**
 * Extracts text content from multilingual object based on selected language
 * @param content - The multilingual content object
 * @param selectedLanguage - The selected language code
 * @returns The text content in the selected language
 */
export const extractMultilingualContent = (
    content: any,
    selectedLanguage: string
): string => {
    if (!content) return '';

    // If content is a string, return it directly
    if (typeof content === 'string') {
        return content;
    }

    // If content is an object with language keys
    if (typeof content === 'object') {
        return (
            content[selectedLanguage] ||
            content.en ||
            content.english ||
            Object.values(content)[0] ||
            ''
        );
    }

    return '';
};

/**
 * Processes HTML content and splits it into lines for display
 * @param htmlContent - The HTML content to process
 * @returns Array of clean text lines
 */
export const processHtmlContentToLines = (htmlContent: string): string[] => {
    if (!htmlContent) return [];

    // Clean the HTML content to plain text
    const cleanedContent = cleanHtmlContent(htmlContent);

    // Split into lines and filter empty ones, but preserve verse structure
    const lines = cleanedContent.split('\n').filter((line: string) => line.trim());

    console.log('📝 Content lines processed:', lines.length, 'lines');
    console.log('📝 Final content lines (CLEAN TEXT):', lines);

    return lines;
};

/**
 * Processes hymn content with proper verse formatting
 * @param htmlContent - The HTML content to process
 * @returns Array of clean text lines with proper verse spacing
 */
export const processHymnContentToLines = (htmlContent: string): string[] => {
    try {
        if (!htmlContent || typeof htmlContent !== 'string') {
            console.warn('⚠️ Invalid HTML content provided for processing');
            return [];
        }

        // Clean the HTML content to plain text
        const cleanedContent = cleanHtmlContent(htmlContent);

        if (!cleanedContent) {
            console.warn('⚠️ No content after HTML cleaning');
            return [];
        }

        // Split into lines and preserve verse structure
        const lines = cleanedContent.split('\n');

        if (!Array.isArray(lines)) {
            console.warn('⚠️ Failed to split content into lines');
            return [];
        }

        // Process lines to maintain verse formatting
        const processedLines: string[] = [];

        lines.forEach((line: string) => {
            try {
                const trimmedLine = line.trim();

                if (trimmedLine) {
                    processedLines.push(trimmedLine);
                } else {
                    // Preserve empty lines for spacing - add extra spacing for better verse separation
                    processedLines.push('');
                }
            } catch (lineError) {
                console.warn('⚠️ Error processing line:', lineError);
                processedLines.push(''); // Add empty line as fallback
            }
        });

        // Add extra spacing after each verse to ensure clear separation
        const finalLines: string[] = [];

        processedLines.forEach((line: string, index: number) => {
            try {
                finalLines.push(line);

                // Add spacing after each verse for better separation
                if (index === processedLines.length - 1) {
                    finalLines.push(''); // Empty line after verse content
                }
            } catch (lineError) {
                console.warn('⚠️ Error processing final line:', lineError);
            }
        });

        // Clean up any excessive empty lines while preserving structure
        const cleanedLines: string[] = [];
        let consecutiveEmptyLines = 0;

        finalLines.forEach((line: string) => {
            try {
                if (line.trim() === '') {
                    consecutiveEmptyLines++;
                    if (consecutiveEmptyLines <= 2) { // Allow max 2 consecutive empty lines
                        cleanedLines.push('');
                    }
                } else {
                    consecutiveEmptyLines = 0;
                    cleanedLines.push(line);
                }
            } catch (cleanupError) {
                console.warn('⚠️ Error in cleanup process:', cleanupError);
            }
        });

        console.log('📝 Hymn content lines processed:', cleanedLines.length, 'lines');
        console.log('📝 Final hymn lines (CLEAN TEXT):', cleanedLines);

        return cleanedLines;
    } catch (error) {
        console.error('❌ Error processing hymn content to lines:', error);
        return ['Error processing hymn content. Please try again.'];
    }
};

/**
 * Extracts and processes multilingual HTML content
 * @param content - The multilingual content object
 * @param selectedLanguage - The selected language code
 * @returns Array of clean text lines in the selected language
 */
export const extractAndProcessMultilingualContent = (
    content: any,
    selectedLanguage: string
): string[] => {
    // Extract content in selected language
    const extractedContent = extractMultilingualContent(content, selectedLanguage);

    // Process HTML content to clean lines
    return processHtmlContentToLines(extractedContent);
};
