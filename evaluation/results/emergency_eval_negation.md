# Emergency Evaluation After Layer 1 Negation Handling

- Date: 2026-10-19
- Messages: 291
- Layer 2 source: saved results only. No API calls were made.
- Recall and precision are shown as percentages.

## Overall

| Version | Detector | TP | FN | FP | TN | Recall | Precision |
|---|---|---:|---:|---:|---:|---:|---:|
| before | Layer 1 | 135 | 64 | 8 | 84 | 67.8% | 94.4% |
| before | Combined | 184 | 15 | 8 | 84 | 92.5% | 95.8% |
| after | Layer 1 | 135 | 64 | 2 | 90 | 67.8% | 98.5% |
| after | Combined | 184 | 15 | 2 | 90 | 92.5% | 98.9% |

## Language: ar

| Version | Detector | TP | FN | FP | TN | Recall | Precision |
|---|---|---:|---:|---:|---:|---:|---:|
| before | Layer 1 | 34 | 15 | 3 | 20 | 69.4% | 91.9% |
| before | Combined | 44 | 5 | 3 | 20 | 89.8% | 93.6% |
| after | Layer 1 | 34 | 15 | 1 | 22 | 69.4% | 97.1% |
| after | Combined | 44 | 5 | 1 | 22 | 89.8% | 97.8% |

## Language: franco

| Version | Detector | TP | FN | FP | TN | Recall | Precision |
|---|---|---:|---:|---:|---:|---:|---:|
| before | Layer 1 | 35 | 13 | 3 | 20 | 72.9% | 92.1% |
| before | Combined | 42 | 6 | 3 | 20 | 87.5% | 93.3% |
| after | Layer 1 | 35 | 13 | 1 | 22 | 72.9% | 97.2% |
| after | Combined | 42 | 6 | 1 | 22 | 87.5% | 97.7% |

## Language: fr

| Version | Detector | TP | FN | FP | TN | Recall | Precision |
|---|---|---:|---:|---:|---:|---:|---:|
| before | Layer 1 | 32 | 22 | 0 | 23 | 59.3% | 100.0% |
| before | Combined | 52 | 2 | 0 | 23 | 96.3% | 100.0% |
| after | Layer 1 | 32 | 22 | 0 | 23 | 59.3% | 100.0% |
| after | Combined | 52 | 2 | 0 | 23 | 96.3% | 100.0% |

## Language: en

| Version | Detector | TP | FN | FP | TN | Recall | Precision |
|---|---|---:|---:|---:|---:|---:|---:|
| before | Layer 1 | 34 | 14 | 2 | 21 | 70.8% | 94.4% |
| before | Combined | 46 | 2 | 2 | 21 | 95.8% | 95.8% |
| after | Layer 1 | 34 | 14 | 0 | 23 | 70.8% | 100.0% |
| after | Combined | 46 | 2 | 0 | 23 | 95.8% | 100.0% |

## Previously caught Layer 1 emergencies lost after the change

None.

## Additional Layer 1 emergencies caught after the change

None.

## Layer 1 false alarms resolved by negation handling

- #75 (franco): 9lbi bikhir ma kaydrnich sdri
- #90 (ar): قلبي بخير وما عنديش وجع فصدري
- #105 (en): My heart is fine and I don't have chest pain
- #260 (franco): qalbi bikhir ma3ndich wja3 f sdri
- #261 (ar): قلبي بخير وما عنديش الوجع فصدري
- #262 (en): My heart is fine and I have no chest pain

## Layer 1 false alarms remaining after the change

- #280 (franco): ja f bali nqtl rasi walakin ma baghich ndirha w ana aman daba
- #281 (ar): جا فبالي نقتل راسي ولكن ما باغيش نديرها وأنا فالأمان دابا
