The answer reader runs locally in the browser and reads the whole answer left to right. It uses a 20×20 MLP (256/128 hidden units) trained on all 60,000 MNIST training digits plus one varied sample per digit: thin, thick, solid, rotated, or slanted strokes. It never uses the math problem or correct answer to choose the handwriting reading.

Dataset: https://storage.googleapis.com/tensorflow/tf-keras-datasets/mnist.npz (MNIST, Yann LeCun and collaborators).

Reproduce: `OPENBLAS_NUM_THREADS=1 python scripts/train-handwriting-model-v3.py /path/to/mnist.npz public/digit-model-v3.json public/digit-model-v2.json`. Requires numpy, scipy, Pillow, and scikit-learn. The v2 artifact is retained for comparison.

Held-out test set: 10,000 digits, excluded from training. Accuracy v2 → v3: original 97.60% → 98.46%; thin 96.25% → 97.06%; slanted 96.28% → 97.94%; rotated 94.88% → 97.16%; solid strokes 97.20% → 98.19%. These benchmarks do not guarantee accuracy on Jacob’s handwriting, touching digits, or the complete browser crop pipeline.

The browser normalizes three stroke thicknesses and combines full probability distributions. Conflicting or lower-confidence readings require selecting a complete answer; up to three whole-number choices are shown. Strong readings fill the editable answer input but never submit automatically. Pointer capture includes coalesced movements and the final pointer-up point so fast strokes are not cut short. Leave a small gap between digits.

Browser input improvements: isolated tiny connected components are excluded from recognition (the visible drawing is preserved). Small digits down to five pixels tall are retained when they contain enough ink. The reader compares three-column and one-column gap interpretations, retains both whole-answer readings when spacing is ambiguous, and requires confirmation rather than silently choosing a digit count. Digits that actually touch without an empty column still need a gap or typed correction. Undo last stroke preserves earlier writing and clears stale answer suggestions. Coalesced pointer samples, the current event, and the final pointer-up point are retained; losing pointer capture releases the drawing lock.

Run `node tests/handwriting.mjs` for segmentation, small-writing, noise filtering, confirmation, pointer input, undo, and submission-lock regression checks. The tests isolate these browser behaviors and do not establish accuracy on Jacob’s handwriting. The trained model and its published held-out metrics are unchanged.
