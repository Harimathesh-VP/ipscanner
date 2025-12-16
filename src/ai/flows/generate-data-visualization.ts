'use server';

/**
 * @fileOverview This file defines a Genkit flow for generating data visualizations based on API data.
 *
 * generateDataVisualization - A function that takes API data as input and returns a data visualization.
 * GenerateDataVisualizationInput - The input type for the generateDataVisualization function.
 * GenerateDataVisualizationOutput - The return type for the generateDataVisualization function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateDataVisualizationInputSchema = z.object({
  apiData: z.string().describe('The API data to visualize, in JSON format.'),
  visualizationType: z.enum(['chart', 'graph', 'table']).describe('The type of visualization to generate.'),
  title: z.string().describe('The title of the visualization.'),
});
export type GenerateDataVisualizationInput = z.infer<typeof GenerateDataVisualizationInputSchema>;

const GenerateDataVisualizationOutputSchema = z.object({
  visualization: z.string().describe('The generated data visualization, in a format suitable for display (e.g., a data URI for an image or a JSON object for a chart).'),
});
export type GenerateDataVisualizationOutput = z.infer<typeof GenerateDataVisualizationOutputSchema>;

export async function generateDataVisualization(input: GenerateDataVisualizationInput): Promise<GenerateDataVisualizationOutput> {
  return generateDataVisualizationFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateDataVisualizationPrompt',
  input: {schema: GenerateDataVisualizationInputSchema},
  output: {schema: GenerateDataVisualizationOutputSchema},
  prompt: `You are an expert data visualization specialist. Given the following API data, generate a visualization of type {{{visualizationType}}}. The visualization should have the title "{{{title}}}".

API Data:
{{{apiData}}}

Respond with the visualization in a format that can be directly displayed in a web application. If the visualization type is 'chart' or 'graph', return a JSON object representing the chart or graph data. If the visualization type is 'table', return an HTML table.

Make sure the JSON is parseable.
`,
});

const generateDataVisualizationFlow = ai.defineFlow(
  {
    name: 'generateDataVisualizationFlow',
    inputSchema: GenerateDataVisualizationInputSchema,
    outputSchema: GenerateDataVisualizationOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
