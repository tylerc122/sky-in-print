"""Reader-facing excerpts that start and end on sentence boundaries.

The eye check cut one clipping at "A meteoric stone weighing..." because excerpts were cut by character count
(results/eyecheck/RESULTS.md, D18). This is for text shown to people. The model's triage excerpt
(triage.excerpt) is part of the validated pipeline and stays unchanged.
"""
import re

# a sentence ends at . ! ? (optionally followed by a quote or bracket) before whitespace. OCR breaks capitals, so
# the next word's case is not required
END = re.compile(r"[.!?][\"')\]]?\s+")
SKY = re.compile(r"aurora|borealis|northern l|meteor|fire.?ball|aerolite|comet|eclipse|shooting star|fell from|ball of fire",
                 re.I)


def sentence_window(text, centre=None, width=900, slack=400):
    """About `width` characters around `centre` (default: the first sky word), widened to whole sentences.

    The start moves back to the previous sentence end; the end moves forward to the next one. Each side gives up
    after `slack` characters and falls back to a word boundary, so a run-on OCR column cannot grow without limit.
    Returns (excerpt, start, end, cut_start, cut_end); the cut flags say an ellipsis belongs on that side.
    """
    text = re.sub(r"\s+", " ", text).strip()
    if len(text) <= width + slack:
        return text, 0, len(text), False, False
    if centre is None:
        m = SKY.search(text)
        centre = m.start() if m else 0
    lo = max(0, centre - width // 3)
    hi = min(len(text), lo + width)
    start = 0
    if lo > 0:
        ends = [m.end() for m in END.finditer(text, max(0, lo - slack), lo)]
        start = ends[-1] if ends else text.rfind(" ", 0, lo) + 1
    end = len(text)
    if hi < len(text):
        m = END.search(text, hi, min(len(text), hi + slack))
        end = m.end() if m else (text.find(" ", hi) if text.find(" ", hi) > 0 else len(text))
    return text[start:end].strip(), start, end, start > 0, end < len(text)


def display(text, centre=None, width=900):
    ex, _, _, a, b = sentence_window(text, centre, width)
    return ("… " if a else "") + ex + (" …" if b else "")
