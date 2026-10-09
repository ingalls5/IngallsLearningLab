The answer reader runs locally in the browser and reads the whole answer left to right. It uses a 20×20 MLP (256/128 hidden units) trained on all 60,000 MNIST training digits plus one varied sample per digit: thin, thick, solid, rotated, or slanted strokes. It never uses the math problem or correct answer to choose the handwriting reading.

Dataset: https://storage.googleapis.com/tensorflow/tf-keras-datasets/mnist.npz (MNIST, Yann LeCun and collaborators).

Reproduce: `OPENBLAS_NUM_THREADS=1 python scripts/train-handwriting-model-v3.py /path/to/mnist.npz public/digit-model-v3.json public/digit-model-v2.json`. Requires numpy, scipy, Pillow, and scikit-learn. The v2 artifact is retained for comparison.

Held-out test set: 10,000 digits, excluded from training. Accuracy v2 → v3: original 97.60% → 98.46%; thin 96.25% → 97.06%; slanted 96.28% → 97.94%; rotated 94.88% → 97.16%; solid strokes 97.20% → 98.19%. These benchmarks do not guarantee accuracy on Jacob’s handwriting, touching digits, or the complete browser crop pipeline.

The browser normalizes three stroke thicknesses and combines full probability distributions. Conflicting or lower-confidence readings require selecting a complete answer; up to three whole-number choices are shown. Strong readings fill the editable answer input but never submit automatically. Pointer capture includes coalesced movements and the final pointer-up point so fast strokes are not cut short. Leave a small gap between digits.
