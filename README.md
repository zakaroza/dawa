# Dawa: a Darija-language medical assistant

Dawa is a mobile app that answers health questions in Darija, the Arabic spoken in everyday life in Morocco. It was built for my MSc dissertation in Advanced Computer Science at Bangor University (2026).

Darija can be typed in Arabic script or in Latin letters and numbers (Franco-Arabic, for example "3ndi skhana"). Dawa understands both, and also works in English.

> **Disclaimer:** Dawa is a research prototype. It is not a medical device and does not replace a doctor or pharmacist. Its answers were not checked by a clinician.

## What it does

- **Health questions in Darija:** you type or speak a question and get an answer in everyday Darija. The app reasons in English first (`openai/gpt-oss-120b` on Groq, with a Darija glossary and NHS guidance), then translates the answer into Darija. It can ask up to three clarifying questions.
- **Emergency detection in two layers:** a keyword list of 175 phrases (Darija in both scripts, French and English) runs on the phone before any API call. The medical model can also flag emergencies the keywords miss. If either layer fires, the app gives no advice and shows a fixed emergency message (15 for Morocco; 999 added in English mode). A typed medicine name goes straight to the medicine search and skips the LLM emergency check.
- **Medicine identification:**
  - **Barcode:** scans the EAN-13 code and finds the exact pack in the Moroccan (AMMPS) or UK (NHS) data, offline, when a matching product record exists.
  - **Photo:** a vision model reads the name on the box, then you pick the right product from a list.
  - **Typed name:** searched offline in the same data.
- **Also built (not evaluated):** profiles with conditions, medications and allergies, allergy warnings, reminders with prescription reading, a symptom log, a medicine library, a self-care guide and read aloud.

## Running the app

You need [Node.js](https://nodejs.org) (LTS) and the **Expo Go** app (SDK 58) on your phone.

```bash
cd app
npm install
cp .env.example .env      # then add your own API keys
npx expo start --tunnel
```

Scan the QR code with the iPhone camera or with Expo Go on Android.

### API keys

The app reads its keys from `app/.env` (see `app/.env.example`):

| Variable | Used for | Where to get it |
|---|---|---|
| `EXPO_PUBLIC_GROQ_API_KEY` | Medical answers, translation and emergency check | https://console.groq.com |
| `EXPO_PUBLIC_GEMINI_API_KEY` | Reading medicine names from photos | https://aistudio.google.com |
| `EXPO_PUBLIC_VOICERSS_KEY` | Reading answers aloud | https://www.voicerss.org |

Variables starting with `EXPO_PUBLIC_` are built into the app, so anyone with a build can read them. Use your own development keys and do not share builds that contain private keys. A real release would need a server to keep the keys private.

## Project structure

```
app/            The React Native (Expo) app
  App.js
  src/screens/  Chat, profiles, reminders, symptom log, medicine library, self-care
  src/utils/    Medicine search (barcodeSearch.js), reminders, storage helpers
  src/data/     AMMPS and NHS medicine and barcode data (bundled, used offline)
  src/i18n/     Darija and English interface text
scraper/        Scripts that built the medicine data, the intent dataset,
                the XLM-R notebook and the 291-message emergency test set
evaluation/     Evaluation scripts and results for the three research questions
```

## Evaluation

The project answers three research questions:

| | Question | Main result |
|---|---|---|
| RQ1 | Is reasoning in English, then translating into Darija, accurate and safe? | Correctness 2.63/3 over 32 answers; safety 3.00 and Darija quality 2.95 over 40 outputs (rated by the author) |
| RQ2 | How reliably do keywords plus an LLM check detect emergencies? | 184 of 199 emergencies detected by the combined system (92.5%), 291 test messages |
| RQ3 | How accurately do barcode, photo and name identify medicines? | 30 of 30 test medicines for each method, after fixes (15 Moroccan, 15 UK) |

For RQ3, barcode success meant the exact pack (strength, form and size); photo and name success meant the right medicine. Barcodes and box photos were shown on a screen, and one photo needed a second attempt.

The scripts in `evaluation/` cover answer generation (RQ1 and English mode), emergency detection (RQ2) and database-wide barcode matching. The 30-medicine RQ3 comparison was done by hand in the app and is recorded in `evaluation/evaluation_test_sheets.xlsx`. The scripts that call the model need a Groq key in `app/.env`. For example:

```bash
node evaluation/emergency_eval.js          # RQ2
node evaluation/barcode_match_eval.mjs     # RQ3 barcode matching, offline
```

Results, answers and ratings are in `evaluation/results/` and `evaluation/evaluation_test_sheets.xlsx`. Model outputs can differ between runs, so rerunning will not give identical answers.

The scripts that call the model continue from the results already saved in `evaluation/results/`, so with the submitted results in place they make no new model calls, and `emergency_eval.js` stops if the saved results come from an older version of the app (before negation handling). To do a fresh run, move the existing result files somewhere else first.

## Data sources

- **AMMPS** (Moroccan Agency of Medicines and Health Products, ammps.gov.ma): medicine list and generic barcode repertoire, collected with the scripts in `scraper/`.
- **NHS dictionary of medicines and devices (dm+d)**: UK medicines and barcodes, processed with `scraper/parse_dmd.py`.

## Limitations

- All answer ratings were given by the author; no clinician checked them.
- No study with real users was carried out.
- The emergency test messages were written by the author, and the RQ3 medicines were reused after fixes.
- The free Groq tier has daily limits.

## Acknowledgements

Supervised at Bangor University.