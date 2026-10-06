# Evaluation Dataset

This folder contains the evaluation dataset and scripts to test the accuracy of English Mentor AI's models.

## Dataset (`dataset.json`)
Currently, this folder contains a small hand-written dataset focusing on:
1. Grammar Check: Common ESL (English as a Second Language) errors.
2. Roleplay: Single conversational turns for testing scenario responses.

### Using a larger public dataset
For a comprehensive grammar evaluation, we recommend using the **JFLEG** (JHU FLuency-Extended GUG) dataset. It provides a robust set of grammatically incorrect sentences and their corrected references.

To use JFLEG:
1. Go to the Hugging Face dataset page: https://huggingface.co/datasets/jfleg
2. Download the validation or test split.
3. Extract 50-100 `input` and `reference` pairs and replace `eval/dataset.json` with this data in the format:
```json
[
  { "type": "grammar", "input": "...", "reference": "..." }
]
```
*(JFLEG is licensed under CC BY-NC-SA 4.0)*

## Running the Evaluation
To run the evaluation script against the core application logic, use:

```bash
npm run eval
```

The script evaluates:
- **Grammar Check**: Tests if the model correctly identifies and fixes grammar mistakes, ensuring the explanation fields are not empty.
- **Roleplay**: Tests if the model can naturally continue a roleplay scenario (e.g. HR interview) and provide proper JSON structures (assistantReply, correction, naturalAlternative, feedback).

**Note**: Ensure your `GEMINI_API_KEY` is set in the `.env` file before running the script, as it will call the Gemini model. The script includes a rate limit delay to respect API limits.

## Results
A summary of the results will be printed to the console and saved to `eval/results.json`.
