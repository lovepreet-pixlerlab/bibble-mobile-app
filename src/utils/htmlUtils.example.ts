/**
 * Example usage of HTML utility functions
 * This file shows how to use the common HTML utilities in different components
 */

import {
    cleanHtmlContent,
    extractAndProcessMultilingualContent,
    extractMultilingualContent,
    processHtmlContentToLines
} from './htmlUtils';

// Example 1: Simple HTML cleaning
export const exampleSimpleHtmlCleaning = () => {
    const htmlContent = '<p>A&nbsp;Mighty&nbsp;Fortress&nbsp;is&nbsp;Our&nbsp;God</p>';
    const cleanText = cleanHtmlContent(htmlContent);
    console.log('Clean text:', cleanText); // "A Mighty Fortress is Our God"
};

// Example 2: Extract multilingual content
export const exampleMultilingualExtraction = () => {
    const multilingualContent = {
        en: '<p>Jesus is King</p>',
        sw: '<p>Yesu ni Mfalme</p>',
        fr: '<p>Jésus est Roi</p>'
    };

    const englishContent = extractMultilingualContent(multilingualContent, 'en');
    const swahiliContent = extractMultilingualContent(multilingualContent, 'sw');

    console.log('English:', englishContent); // '<p>Jesus is King</p>'
    console.log('Swahili:', swahiliContent); // '<p>Yesu ni Mfalme</p>'
};

// Example 3: Process HTML to lines
export const exampleProcessToLines = () => {
    const htmlContent = '<p>Line 1</p><p>Line 2</p><p>Line 3</p>';
    const lines = processHtmlContentToLines(htmlContent);
    console.log('Lines:', lines); // ["Line 1", "Line 2", "Line 3"]
};

// Example 4: Complete multilingual processing
export const exampleCompleteProcessing = () => {
    const multilingualContent = {
        en: '<p>A&nbsp;Mighty&nbsp;Fortress&nbsp;is&nbsp;Our&nbsp;God</p>',
        sw: '<p>Umwubatsi&nbsp;w\'Umbaraga&nbsp;ni&nbsp;Imana&nbsp;yacu</p>'
    };

    const englishLines = extractAndProcessMultilingualContent(multilingualContent, 'en');
    const swahiliLines = extractAndProcessMultilingualContent(multilingualContent, 'sw');

    console.log('English lines:', englishLines); // ["A Mighty Fortress is Our God"]
    console.log('Swahili lines:', swahiliLines); // ["Umwubatsi w'Umbaraga ni Imana yacu"]
};

// Example 5: Usage in React component
export const exampleReactComponentUsage = () => {
    // In a React component:
    /*
    import { extractAndProcessMultilingualContent } from '@/src/utils/htmlUtils';
    
    const MyComponent = ({ content, selectedLanguage }) => {
        const contentLines = React.useMemo(() => {
            return extractAndProcessMultilingualContent(content, selectedLanguage);
        }, [content, selectedLanguage]);
        
        return (
            <View>
                {contentLines.map((line, index) => (
                    <Text key={index}>{line}</Text>
                ))}
            </View>
        );
    };
    */
};
