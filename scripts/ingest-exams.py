#!/usr/bin/env python3
"""
Ingest archived exam PDFs into CryptoEx JSON question banks.

Generates the missing exam datasets in project schema:
- src/data/questions/exam-YYYY.json
- src/data/questions/exam-YYYY-resit.json

The parser is tuned to TTM4135 exam PDF layouts and supports:
- MCQ question parsing from question PDFs
- MCQ answer extraction from solution PDFs (grid and inline formats)
- Written question/solution parsing with part splitting
- Equal point distribution fallback in 0.5 steps
"""

from __future__ import annotations

import json
import math
import re
from dataclasses import dataclass
from pathlib import Path
from typing import Dict, Iterable, List, Optional, Tuple

import fitz
import pypdf


ROOT = Path(__file__).resolve().parents[1]
EXAMS_DIR = Path(r"C:\Users\bjork\Desktop\Crypto\krypto_eksamener\exams")
OUT_DIR = ROOT / "src" / "data" / "questions"

CHECK_CHARS = {"\x00", "\x08", "\x13", "\u2713", "✓"}
OPTION_KEYS = ["a", "b", "c", "d"]


TOPIC_KEYWORDS: dict[str, list[str]] = {
    "number-theory-basics": [
        "gcd",
        "euclidean algorithm",
        "euclid",
        "modular arithmetic",
        "mod ",
        "congruence",
        "division algorithm",
        "modulo",
        "divisibility",
        "greatest common divisor",
        "extended euclidean",
        "inverse modulo",
        "chinese remainder",
    ],
    "classical-encryption": [
        "caesar",
        "vigenère",
        "vigenere",
        "substitution cipher",
        "frequency analysis",
        "monoalphabetic",
        "polyalphabetic",
        "affine cipher",
        "transposition",
        "classical cipher",
        "hill cipher",
    ],
    "hill-stream-otp": [
        "hill cipher",
        "lfsr",
        "rc4",
        "one-time pad",
        "otp",
        "stream cipher",
        "perfect secrecy",
        "vernam",
        "known-plaintext",
        "keystream",
    ],
    "block-ciphers": [
        "des ",
        "aes",
        "feistel",
        "s-box",
        "rijndael",
        "block cipher",
        "key schedule",
        "round function",
        "substitution-permutation",
        "diffusion",
        "confusion",
        "double des",
        "triple-des",
    ],
    "encryption-modes": [
        "ecb",
        "cbc",
        "ctr mode",
        "ofb",
        "cfb",
        "encryption mode",
        "initialisation vector",
        "initialization vector",
        " iv ",
        "padding oracle",
        "pkcs#7",
        "pkcs #7",
        "cmac",
        "gcm",
    ],
    "hashes-macs": [
        "sha-",
        "sha1",
        "sha-1",
        "sha256",
        "sha-256",
        "hmac",
        "hash function",
        "collision",
        "birthday attack",
        "merkle-damgård",
        "merkle-damgard",
        "mac ",
        "message authentication code",
        "preimage",
        "digest",
        "cmac",
    ],
    "number-theory-pk": [
        "euler's theorem",
        "eulers theorem",
        "euler's function",
        "fermat's theorem",
        "fermats theorem",
        "chinese remainder",
        "crt",
        "primitive root",
        "euler's totient",
        "totient",
        "miller-rabin",
        "fermat test",
    ],
    "public-key-rsa": [
        "rsa ",
        "rsa-",
        "public key",
        "public-key",
        "private key",
        "modular exponentiation",
        "square-and-multiply",
        "oaep",
        "pkcs#1",
        "pkcs #1",
        "trapdoor",
        "factorisation",
        "factorization",
    ],
    "discrete-log-crypto": [
        "diffie-hellman",
        "diffie hellman",
        "elgamal encryption",
        "elliptic curve",
        "ecdh",
        "cdh",
        "ddh",
        "discrete log",
        "generator g",
        "cyclic group",
        "point multiplication",
        "z*",
        "z∗",
    ],
    "digital-signatures": [
        "digital signature",
        "rsa signature",
        "schnorr",
        "dsa",
        "ecdsa",
        "non-repudiation",
        "signature scheme",
        "sign and verify",
        "unforgeability",
        "certificate",
        "certification authority",
        "x.509",
    ],
    "key-establishment": [
        "key exchange",
        "key establishment",
        "certificate authority",
        "x.509",
        "kerberos",
        "authenticated key",
        "session key",
        "man-in-the-middle",
        "station-to-station",
    ],
    "quantum-safe": [
        "quantum",
        "shor",
        "grover",
        "lattice",
        "post-quantum",
        "pqc",
        "ml-kem",
        "ml-dsa",
        "kyber",
        "dilithium",
        "harvest now",
    ],
    "tls": [
        "tls 1.2",
        "tls1.2",
        "handshake protocol",
        "cipher suite",
        "ssl",
        "record protocol",
        "pre-master",
        "master secret",
        "client hello",
        "server hello",
        "transport layer security",
        "certificate",
        "x.509",
    ],
    "tls13-ipsec": [
        "tls 1.3",
        "tls1.3",
        "ipsec",
        "esp ",
        "ah ",
        "ike ",
        "0-rtt",
        "early data",
        "security association",
        "tunnel mode",
        "transport mode",
    ],
    "email-messaging-security": [
        "pgp",
        "s/mime",
        "signal protocol",
        "end-to-end encryption",
        "double ratchet",
        "x3dh",
        "openpgp",
        "email security",
        "header",
        "mail server",
    ],
}


MANUAL_2015_REGULAR_ANSWERS = {
    1: "b",
    2: "c",
    3: "d",
    4: "a",
    5: "d",
    6: "c",
    7: "d",
    8: "c",
    9: "a",
    10: "a",
    11: "b",
    12: "a",
    13: "d",
    14: "b",
    15: "a",
    16: "d",
    17: "a",
    18: "b",
    19: "c",
    20: "d",
}


@dataclass(frozen=True)
class ExamConfig:
    year: int
    resit: bool
    question_pdf: str
    solution_pdf: Optional[str]
    expected_mcq: int
    expected_written: int
    written_points: float
    answer_mode: str  # "grid", "inline", "manual"
    manual_answers: Optional[Dict[int, str]] = None

    @property
    def file_name(self) -> str:
        suffix = "-resit" if self.resit else ""
        return f"exam-{self.year}{suffix}.json"

    @property
    def id_prefix(self) -> str:
        return f"exam{self.year}{'-resit' if self.resit else ''}"

    @property
    def label_base(self) -> str:
        return f"Exam {self.year}{' Resit' if self.resit else ''}"


CONFIGS: List[ExamConfig] = [
    ExamConfig(
        year=2025,
        resit=True,
        question_pdf="2025-resit-questions.pdf",
        solution_pdf="2025-resit-solutions.pdf",
        expected_mcq=30,
        expected_written=5,
        written_points=6,
        answer_mode="grid",
    ),
    ExamConfig(
        year=2021,
        resit=True,
        question_pdf="2021-resit-questions.pdf",
        solution_pdf="2021-resit-solutions.pdf",
        expected_mcq=15,
        expected_written=6,
        written_points=5,
        answer_mode="inline",
    ),
    ExamConfig(
        year=2020,
        resit=False,
        question_pdf="2020-questions.pdf",
        solution_pdf="2020-solutions.pdf",
        expected_mcq=15,
        expected_written=6,
        written_points=5,
        answer_mode="inline",
    ),
    ExamConfig(
        year=2018,
        resit=True,
        question_pdf="2018-resit-questions.pdf",
        solution_pdf="2018-resit-solutions.pdf",
        expected_mcq=30,
        expected_written=6,
        written_points=5,
        answer_mode="grid",
    ),
    ExamConfig(
        year=2018,
        resit=False,
        question_pdf="2018-questions.pdf",
        solution_pdf="2018-solutions.pdf",
        expected_mcq=30,
        expected_written=6,
        written_points=5,
        answer_mode="grid",
    ),
    ExamConfig(
        year=2017,
        resit=True,
        question_pdf="2017-resit-questions.pdf",
        solution_pdf="2017-resit-solutions.pdf",
        expected_mcq=30,
        expected_written=6,
        written_points=5,
        answer_mode="grid",
    ),
    ExamConfig(
        year=2017,
        resit=False,
        question_pdf="2017-questions.pdf",
        solution_pdf="2017-solutions.pdf",
        expected_mcq=30,
        expected_written=6,
        written_points=5,
        answer_mode="grid",
    ),
    ExamConfig(
        year=2016,
        resit=True,
        question_pdf="2016-resit-questions.pdf",
        solution_pdf="2016-resit-solutions.pdf",
        expected_mcq=25,
        expected_written=7,
        written_points=5,
        answer_mode="grid",
    ),
    ExamConfig(
        year=2016,
        resit=False,
        question_pdf="2016-questions.pdf",
        solution_pdf="2016-solutions.pdf",
        expected_mcq=25,
        expected_written=7,
        written_points=5,
        answer_mode="grid",
    ),
    ExamConfig(
        year=2015,
        resit=True,
        question_pdf="2015-resit-questions.pdf",
        solution_pdf="2015-resit-solutions.pdf",
        expected_mcq=20,
        expected_written=8,
        written_points=5,
        answer_mode="grid",
    ),
    ExamConfig(
        year=2015,
        resit=False,
        question_pdf="2015-questions.pdf",
        solution_pdf="2015-solutions.pdf",
        expected_mcq=20,
        expected_written=8,
        written_points=5,
        answer_mode="manual",
        manual_answers=MANUAL_2015_REGULAR_ANSWERS,
    ),
]


def extract_pdf_text(path: Path) -> str:
    # PyMuPDF is significantly better on several archived exam PDFs (notably 2025 resit).
    doc = fitz.open(str(path))
    text = "\n".join((page.get_text("text") or "") for page in doc)
    text = normalize_text(text)
    if text.strip():
        return text

    # Fallback for edge files where fitz yields nothing.
    reader = pypdf.PdfReader(str(path))
    fallback = "\n".join((p.extract_text() or "") for p in reader.pages)
    return normalize_text(fallback)


def normalize_text(text: str) -> str:
    replacements = {
        "\ufb01": "fi",
        "\ufb02": "fl",
        "\ufb00": "ff",
        "–": "-",
        "—": "-",
        "−": "-",
        "\u00a0": " ",
        "′": "'",
    }
    for src, dst in replacements.items():
        text = text.replace(src, dst)
    # Remove standalone page-number lines introduced by PDF extraction.
    text = re.sub(r"(?m)^\s*\d+\s*$", "", text)
    text = re.sub(r"[ \t]+\n", "\n", text)
    text = re.sub(r"\n{3,}", "\n\n", text)
    return text


def clean_inline(text: str) -> str:
    s = text
    s = re.sub(r"Page\s+\d+\s+of\s+\d+", " ", s)
    s = re.sub(r"ATTACHMENT.*$", " ", s, flags=re.I | re.S)
    s = re.sub(r"\s+", " ", s)
    return s.strip()


def find_section(text: str, start_tokens: Iterable[str], end_tokens: Iterable[str]) -> str:
    lower = text.lower()

    def token_idx(token: str, start_pos: int = 0) -> int:
        patt = re.escape(token.lower()).replace(r"\ ", r"\s+")
        m = re.search(patt, lower[start_pos:], flags=re.I)
        if not m:
            return -1
        return start_pos + m.start()

    start_idx = -1
    for token in start_tokens:
        idx = token_idx(token)
        if idx != -1:
            start_idx = idx
            break
    if start_idx == -1:
        return ""

    end_idx = len(text)
    for token in end_tokens:
        idx = token_idx(token, start_idx + 1)
        if idx != -1:
            end_idx = min(end_idx, idx)
    return text[start_idx:end_idx]


def split_numbered_blocks(section: str) -> List[Tuple[int, str]]:
    matches = list(re.finditer(r"(?m)^\s*(\d+)\.\s", section))
    blocks: List[Tuple[int, str]] = []
    for i, m in enumerate(matches):
        qn = int(m.group(1))
        end = matches[i + 1].start() if i + 1 < len(matches) else len(section)
        block = section[m.start() : end].strip()
        blocks.append((qn, block))
    return blocks


def parse_mcq_blocks(mcq_section: str, expected: int) -> Dict[int, Dict]:
    out: Dict[int, Dict] = {}
    blocks = split_numbered_blocks(mcq_section)
    for qn, raw in blocks:
        if qn > expected:
            continue
        if "(a)" not in raw:
            continue
        opt_matches = list(re.finditer(r"\(([a-d])\)\s", raw, flags=re.I))
        if len(opt_matches) < 2:
            continue
        q_start = raw.find(".")
        stem = raw[q_start + 1 : opt_matches[0].start()]
        stem = clean_inline(stem)

        options = []
        for i, om in enumerate(opt_matches):
            key = om.group(1).lower()
            seg_end = opt_matches[i + 1].start() if i + 1 < len(opt_matches) else len(raw)
            seg = raw[om.end() : seg_end]
            seg = re.split(r"\bExplanation\s*:", seg, maxsplit=1, flags=re.I)[0]
            seg = clean_inline(seg)
            options.append({"key": key, "text": seg})

        out[qn] = {
            "stem": stem,
            "options": options,
        }
    return out


def extract_control_mark_answer(block: str) -> Optional[str]:
    letters = list(re.finditer(r"\(([a-d])\)", block, flags=re.I))
    if not letters:
        return None
    # Pass 1: explicit control/check chars
    for i, lm in enumerate(letters):
        seg_end = letters[i + 1].start() if i + 1 < len(letters) else len(block)
        seg = block[lm.end() : seg_end]
        if any(ch in seg for ch in CHECK_CHARS):
            return lm.group(1).lower()
    # Pass 2: legacy PDFs where selected option is rendered as 2" and others as box/star.
    for i, lm in enumerate(letters):
        seg_end = letters[i + 1].start() if i + 1 < len(letters) else len(block)
        seg = block[lm.end() : seg_end]
        if re.search(r'2\s*["”]', seg) and "□" not in seg and "⇤" not in seg:
            return lm.group(1).lower()
    return None


def parse_grid_answers(sol_text: str, expected: int) -> Dict[int, str]:
    answers: Dict[int, str] = {}
    for qn in range(1, expected + 1):
        pattern = rf"\b{qn}\.\s*\(a\).*?(?=(?:\b{qn + 1}\.\s*\(a\)|Exercise\s*2|Written\s+answer\s+questions|Page\s+\d+\s+of\s+\d+|$))"
        m = re.search(pattern, sol_text, flags=re.S | re.I)
        if not m:
            continue
        ans = extract_control_mark_answer(m.group(0))
        if ans:
            answers[qn] = ans
    return answers


def parse_inline_answers_and_explanations(sol_text: str, expected: int) -> Tuple[Dict[int, str], Dict[int, str]]:
    answers: Dict[int, str] = {}
    explanations: Dict[int, str] = {}

    mcq_section = find_section(
        sol_text,
        ["1 Multiple choice questions", "Exercise 1 Multiple choice questions"],
        ["2 Written answer questions", "Exercise 2", "Written answer questions"],
    )
    if not mcq_section:
        mcq_section = sol_text

    blocks = split_numbered_blocks(mcq_section)
    for qn, raw in blocks:
        if qn > expected or "(a)" not in raw:
            continue
        ans = extract_control_mark_answer(raw)
        if ans:
            answers[qn] = ans
        em = re.search(r"\bExplanation\s*:\s*(.*)$", raw, flags=re.S | re.I)
        if em:
            explanations[qn] = clean_inline(em.group(1))
    return answers, explanations


def parse_written_blocks(section: str, expected: int) -> Dict[int, str]:
    out: Dict[int, str] = {}
    blocks = split_numbered_blocks(section)
    for qn, raw in blocks:
        if qn > expected:
            continue
        q_start = raw.find(".")
        content = raw[q_start + 1 :].strip() if q_start != -1 else raw
        out[qn] = content
    return out


def split_parts(text: str) -> Tuple[str, List[Tuple[str, str]]]:
    marks = list(re.finditer(r"(?m)^\s*\(([a-z])\)\s", text))
    if not marks:
        cleaned = clean_inline(text)
        return cleaned, [("a", cleaned)]

    intro = clean_inline(text[: marks[0].start()])
    parts: List[Tuple[str, str]] = []
    for i, m in enumerate(marks):
        label = m.group(1).lower()
        end = marks[i + 1].start() if i + 1 < len(marks) else len(text)
        part_text = clean_inline(text[m.end() : end])
        parts.append((label, part_text))
    return intro, parts


def split_solution_parts(text: str) -> Dict[str, str]:
    marks = list(re.finditer(r"(?m)^\s*\(([a-z])\)\s", text))
    if not marks:
        return {"a": clean_inline(text)}
    out: Dict[str, str] = {}
    for i, m in enumerate(marks):
        label = m.group(1).lower()
        end = marks[i + 1].start() if i + 1 < len(marks) else len(text)
        out[label] = clean_inline(text[m.end() : end])
    return out


def distribute_points(total: float, count: int) -> List[float]:
    if count <= 0:
        return []
    half_units = int(round(total * 2))
    q, r = divmod(half_units, count)
    vals = [q / 2.0 for _ in range(count)]
    for i in range(r):
        vals[i] += 0.5
    return vals


def classify_topics(text: str) -> List[str]:
    combined = text.lower()
    scores: Dict[str, int] = {}
    for topic, kws in TOPIC_KEYWORDS.items():
        s = sum(1 for kw in kws if kw in combined)
        if s > 0:
            scores[topic] = s
    if not scores:
        return ["number-theory-basics"]
    ordered = sorted(scores.items(), key=lambda x: (-x[1], x[0]))
    top = ordered[0][1]
    threshold = max(1, top // 2)
    picked = [t for t, s in ordered if s >= threshold][:3]
    return picked


def estimate_difficulty(text: str, option_count: int) -> int:
    t = text.lower()
    score = 0
    if len(text) > 220:
        score += 1
    if "$" in text or "mod" in t or "proof" in t:
        score += 1
    if option_count >= 4:
        score += 1
    if any(k in t for k in ["show that", "explain", "compare", "derive", "attack"]):
        score += 1
    if score <= 1:
        return 1
    if score <= 2:
        return 2
    return 3


def fmt_points(v: float) -> float | int:
    if abs(v - round(v)) < 1e-9:
        return int(round(v))
    return v


def build_exam(config: ExamConfig) -> List[Dict]:
    q_path = EXAMS_DIR / config.question_pdf
    s_path = EXAMS_DIR / config.solution_pdf if config.solution_pdf else None
    q_text = extract_pdf_text(q_path)
    s_text = extract_pdf_text(s_path) if s_path and s_path.exists() else ""

    mcq_section = find_section(
        q_text,
        [
            "Exercise 1 Multiple choice questions",
            "1 Multiple choice questions",
            "Multiple choice questions",
        ],
        ["Exercise 2", "2 Written answer questions", "Written answer questions"],
    )
    if not mcq_section:
        mcq_section = q_text
    mcq_blocks = parse_mcq_blocks(mcq_section, config.expected_mcq)
    if len(mcq_blocks) < config.expected_mcq:
        # Fallback for PDFs where heading extraction points to answer-sheet attachment.
        m_heading = re.search(r"(?im)multiple\s+choice\s+questions", q_text)
        start_from = m_heading.end() if m_heading else 0
        m_start = re.search(r"(?m)^\s*1\.\s+(?!\()", q_text[start_from:])
        m_end = re.search(
            r"(?im)^\s*(Exercise\s*2\s+Written answer questions|Written answer questions|2\s+Written answer questions)",
            q_text[start_from:],
        )
        if m_start:
            start_idx = start_from + m_start.start()
            end_idx = (
                start_from + m_end.start()
                if m_end and (start_from + m_end.start()) > start_idx
                else len(q_text)
            )
            mcq_section = q_text[start_idx:end_idx]
            mcq_blocks = parse_mcq_blocks(mcq_section, config.expected_mcq)
    if len(mcq_blocks) < config.expected_mcq:
        raise RuntimeError(
            f"{config.file_name}: parsed {len(mcq_blocks)} MCQs, expected {config.expected_mcq}"
        )

    answers: Dict[int, str] = {}
    mcq_explanations: Dict[int, str] = {}
    if config.answer_mode == "grid":
        answers = parse_grid_answers(s_text, config.expected_mcq)
    elif config.answer_mode == "inline":
        answers, mcq_explanations = parse_inline_answers_and_explanations(
            s_text, config.expected_mcq
        )
    elif config.answer_mode == "manual":
        answers = dict(config.manual_answers or {})
    else:
        raise RuntimeError(f"Unknown answer mode: {config.answer_mode}")

    if len(answers) < config.expected_mcq:
        missing = [n for n in range(1, config.expected_mcq + 1) if n not in answers]
        raise RuntimeError(f"{config.file_name}: missing MCQ answers for {missing}")

    written_q_blocks: Dict[int, str] = {}
    written_s_blocks: Dict[int, str] = {}
    if config.expected_written > 0:
        wq_section = find_section(
            q_text,
            [
                "Exercise 2 Written answer questions",
                "2 Written answer questions",
                "Written answer questions",
            ],
            ["Candidate number", "Answer page", "Attached answer page"],
        )
        if not wq_section:
            wq_section = find_section(
                q_text,
                ["Exercise 2", "2 Written answer questions"],
                ["Candidate number", "Answer page"],
            )
        written_q_blocks = parse_written_blocks(wq_section, config.expected_written)
        if len(written_q_blocks) < config.expected_written:
            raise RuntimeError(
                f"{config.file_name}: parsed {len(written_q_blocks)} written questions, expected {config.expected_written}"
            )

        ws_section = find_section(
            s_text,
            ["Exercise 2 Written answer questions", "2 Written answer questions", "Written answer questions"],
            ["Candidate number", "Answer page"],
        )
        if not ws_section:
            ws_section = s_text
        written_s_blocks = parse_written_blocks(ws_section, config.expected_written)

    result: List[Dict] = []

    for qn in range(1, config.expected_mcq + 1):
        block = mcq_blocks[qn]
        options = block["options"]
        corr = answers[qn]
        solution = mcq_explanations.get(qn) or f"Correct answer: ({corr})."
        body = f"{block['stem']} {' '.join(o['text'] for o in options)} {solution}"
        topics = classify_topics(body)
        diff = estimate_difficulty(block["stem"], len(options))
        result.append(
            {
                "id": f"{config.id_prefix}-mcq{qn:02d}",
                "type": "mcq",
                "topics": topics,
                "source": {"type": "exam", "label": f"{config.label_base} Q{qn}"},
                "difficulty": diff,
                "text": block["stem"],
                "options": options,
                "correctAnswer": corr,
                "solution": solution,
            }
        )

    for qn in range(1, config.expected_written + 1):
        qraw = written_q_blocks[qn]
        sraw = written_s_blocks.get(qn, "")
        q_intro, q_parts = split_parts(qraw)
        s_parts = split_solution_parts(sraw)
        part_points = distribute_points(config.written_points, len(q_parts))
        parts_out = []
        for i, (label, ptxt) in enumerate(q_parts):
            sol = s_parts.get(label)
            if not sol:
                sol = s_parts.get("a", clean_inline(sraw)) or "No outline solution found."
            parts_out.append(
                {
                    "partLabel": label,
                    "points": fmt_points(part_points[i]),
                    "text": ptxt,
                    "solution": sol,
                }
            )
        text_for_topics = q_intro + " " + " ".join(p["text"] for p in parts_out) + " " + " ".join(
            p["solution"] for p in parts_out
        )
        topics = classify_topics(text_for_topics)
        diff = estimate_difficulty(text_for_topics, 4)
        result.append(
            {
                "id": f"{config.id_prefix}-w-{qn}",
                "type": "written",
                "topics": topics,
                "source": {"type": "exam", "label": f"{config.label_base} W{qn}"},
                "difficulty": diff,
                "text": q_intro or f"Written question {qn}.",
                "parts": parts_out,
                "totalPoints": fmt_points(config.written_points),
            }
        )

    return result


def validate_dataset(items: List[Dict], cfg: ExamConfig) -> None:
    ids = [q["id"] for q in items]
    if len(ids) != len(set(ids)):
        raise RuntimeError(f"{cfg.file_name}: duplicate IDs detected")
    mcq = [q for q in items if q["type"] == "mcq"]
    wr = [q for q in items if q["type"] == "written"]
    if len(mcq) != cfg.expected_mcq or len(wr) != cfg.expected_written:
        raise RuntimeError(
            f"{cfg.file_name}: count mismatch mcq={len(mcq)}/{cfg.expected_mcq}, written={len(wr)}/{cfg.expected_written}"
        )
    for q in mcq:
        keys = {o["key"] for o in q["options"]}
        if q["correctAnswer"] not in keys:
            raise RuntimeError(f"{cfg.file_name}: invalid correctAnswer in {q['id']}")
    for q in wr:
        total = sum(float(p["points"]) for p in q["parts"])
        if abs(total - float(q["totalPoints"])) > 1e-9:
            raise RuntimeError(
                f"{cfg.file_name}: written points mismatch in {q['id']} ({total} != {q['totalPoints']})"
            )


def main() -> None:
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    for cfg in CONFIGS:
        print(f"Building {cfg.file_name} ...")
        items = build_exam(cfg)
        validate_dataset(items, cfg)
        out_path = OUT_DIR / cfg.file_name
        out_path.write_text(
            json.dumps(items, indent=2, ensure_ascii=False) + "\n",
            encoding="utf-8",
        )
        mcq_count = sum(1 for q in items if q["type"] == "mcq")
        wr_count = sum(1 for q in items if q["type"] == "written")
        print(f"  wrote {out_path.name}: mcq={mcq_count}, written={wr_count}")


if __name__ == "__main__":
    main()
