# Evaluation Dataset

This folder contains the evaluation dataset and scripts to test the accuracy of English Mentor AI's grammar checking capabilities.

## Dataset (`dataset.json`)
Currently, this folder contains a small 20-example hand-written dataset focusing on common ESL (English as a Second Language) errors.

### Using a larger public dataset
For a comprehensive evaluation, we recommend using the **JFLEG** (JHU FLuency-Extended GUG) dataset. It provides a robust set of grammatically incorrect sentences and their corrected references.

To use JFLEG:
1. Go to the Hugging Face dataset page: https://huggingface.co/datasets/jfleg
2. Download the validation or test split.
3. Extract 50-100 `input` and `reference` pairs and replace `eval/dataset.json` with this data in the format:
\`\`\`json
[
  { "input": "...", "reference": "..." }
]
\`\`\`
*(JFLEG is licensed under CC BY-NC-SA 4.0)*

## Running the Evaluation
To run the evaluation script against your live API or model logic, use:

\`\`\`bash
npm run eval
\`\`\`

**Note**: Ensure your `GEMINI_API_KEY` is set in the `.env` file before running the script, as it will call the Gemini model. The script includes a rate limit delay to respect API limits.

## Results
A summary of the results will be printed to the console and saved to `eval/results.json`.
