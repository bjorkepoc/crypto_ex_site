"""
Convert NotebookLM quiz JSON files into CryptoEx question bank format.

Usage: python scripts/convert-nlm-quizzes.py
Output: src/data/questions/notebooklm-batch.json
"""

import json
import glob
import hashlib
import os
import re

INPUT_DIR = os.path.join(os.path.dirname(__file__), "..", "src", "data", "notebooklm-raw")
OUTPUT_FILE = os.path.join(os.path.dirname(__file__), "..", "src", "data", "questions", "notebooklm-batch.json")

# Topic classification keywords (lowercase)
TOPIC_KEYWORDS: dict[str, list[str]] = {
    "number-theory-basics": [
        "gcd", "euclidean algorithm", "euclid", "modular arithmetic", "mod ",
        "congruence", "division algorithm", "modulo", "divisibility",
        "greatest common divisor", "extended euclidean",
    ],
    "classical-encryption": [
        "caesar", "vigenère", "vigenere", "substitution cipher", "frequency analysis",
        "monoalphabetic", "polyalphabetic", "affine cipher", "transposition",
        "classical cipher", "classical encryption",
    ],
    "hill-stream-otp": [
        "hill cipher", "lfsr", "rc4", "one-time pad", "otp", "stream cipher",
        "perfect secrecy", "vernam", "known-plaintext",
    ],
    "block-ciphers": [
        "des ", "aes", "feistel", "s-box", "rijndael", "block cipher",
        "key schedule", "round function", "substitution-permutation",
        "diffusion", "confusion",
    ],
    "encryption-modes": [
        "ecb", "cbc", "ctr mode", "ofb", "cfb", "encryption mode",
        "initialisation vector", "initialization vector", " iv ",
        "padding oracle", "pkcs#7", "pkcs #7",
    ],
    "hashes-macs": [
        "sha-", "sha256", "sha-256", "hmac", "hash function", "collision",
        "birthday attack", "merkle-damgård", "merkle-damgard", "mac ",
        "message authentication code", "preimage", "hash collision",
        "digest", "sponge construction",
    ],
    "number-theory-pk": [
        "euler's theorem", "eulers theorem", "euler's function", "fermat's theorem",
        "fermats theorem", "chinese remainder", "crt", "primitive root",
        "euler's totient", "phi(n)", "φ(n)", "totient",
    ],
    "public-key-rsa": [
        "rsa ", "rsa-", "public key", "public-key", "private key",
        "modular exponentiation", "square-and-multiply", "oaep",
        "pkcs#1", "pkcs #1", "trapdoor", "hybrid encryption",
        "miller-rabin", "primality", "håstad", "hastad",
    ],
    "discrete-log-crypto": [
        "diffie-hellman", "diffie hellman", "elgamal encryption", "elliptic curve",
        "ecdh", "cdh", "ddh", "discrete log", "discrete-log",
        "generator g", "cyclic group", "point multiplication",
    ],
    "digital-signatures": [
        "digital signature", "rsa signature", "schnorr", "dsa", "ecdsa",
        "non-repudiation", "signature scheme", "sign and verify",
        "existential unforgeability", "euf-cma", "eddsa", "ed25519",
    ],
    "key-establishment": [
        "key exchange", "key establishment", "certificate", "pki",
        "certificate authority", " ca ", "x.509", "key agreement",
        "key transport", "station-to-station",
    ],
    "quantum-safe": [
        "quantum", "shor", "grover", "lattice", "post-quantum", "pqc",
        "ml-kem", "ml-dsa", "kyber", "dilithium", "lwe", "sis ",
        "harvest now", "cnsa", "qubits", "qubit",
    ],
    "tls": [
        "tls 1.2", "tls1.2", "handshake protocol", "cipher suite",
        "ssl", "record protocol", "pre-master", "master secret",
        "client hello", "server hello", "tls handshake", "tls record",
        "tls protocol", "transport layer security", "mac-then-encrypt",
        "encrypt-then-mac", "$tls$",
    ],
    "tls13-ipsec": [
        "tls 1.3", "tls1.3", "ipsec", "esp ", "ah ", "ike ",
        "0-rtt", "early data", "security association",
        "tunnel mode", "transport mode",
    ],
    "email-messaging-security": [
        "pgp", "s/mime", "signal protocol", "end-to-end encryption",
        "double ratchet", "x3dh", "openpgp", "email security",
        "imessage", "pq3", "pqxdh",
    ],
}

# Keys in order for option labeling
OPTION_KEYS = ["a", "b", "c", "d", "e", "f"]


def classify_topic(question_text: str, options_text: str, hint: str, quiz_title: str) -> list[str]:
    """Classify a question into one or more topics based on keyword matching."""
    combined = (question_text + " " + options_text + " " + hint + " " + quiz_title).lower()

    scores: dict[str, int] = {}
    for topic_id, keywords in TOPIC_KEYWORDS.items():
        score = sum(1 for kw in keywords if kw in combined)
        if score > 0:
            scores[topic_id] = score

    if not scores:
        # Fallback: try quiz title
        title_lower = quiz_title.lower()
        if "quantum" in title_lower:
            return ["quantum-safe"]
        if "rsa" in title_lower:
            return ["public-key-rsa"]
        if "database" in title_lower:
            return []  # Skip non-crypto questions
        return []

    # Return topics sorted by score (highest first), take top 1-2
    sorted_topics = sorted(scores.items(), key=lambda x: -x[1])
    top_score = sorted_topics[0][1]
    # Include topics with score >= half of top score
    threshold = max(1, top_score // 2)
    result = [t for t, s in sorted_topics if s >= threshold]
    return result[:3]  # Max 3 topics per question


def estimate_difficulty(question_text: str, options: list, hint: str) -> int:
    """Estimate difficulty 1-3 based on heuristics."""
    combined = (question_text + " " + hint).lower()
    # Longer questions with more math tend to be harder
    has_math = "$" in question_text
    text_len = len(question_text)
    option_count = len(options)

    score = 0
    if has_math:
        score += 1
    if text_len > 200:
        score += 1
    if option_count > 4:
        score += 1
    # Certain keywords suggest harder questions
    hard_keywords = ["prove", "derive", "show that", "which of the following is not",
                     "compare", "distinguish", "intersection", "approximate"]
    if any(kw in combined for kw in hard_keywords):
        score += 1

    if score <= 0:
        return 1
    elif score <= 1:
        return 2
    else:
        return 3


def make_id(quiz_idx: int, q_idx: int, text: str) -> str:
    """Generate a stable, unique question ID."""
    h = hashlib.md5(text.encode()).hexdigest()[:6]
    return f"nlm-{quiz_idx:02d}-{q_idx:02d}-{h}"


def build_solution(options: list, hint: str) -> str:
    """Build a solution text from option rationales and hint."""
    parts = []

    # Find correct answer rationale
    for opt in options:
        if opt.get("isCorrect"):
            parts.append(f"**Correct answer:** {opt['text']}\n\n{opt['rationale']}")
            break

    # Add wrong answer explanations
    wrong = [opt for opt in options if not opt.get("isCorrect")]
    if wrong:
        parts.append("\n**Why other options are wrong:**")
        for opt in wrong:
            parts.append(f"- **{opt['text']}**: {opt['rationale']}")

    if hint:
        parts.append(f"\n**Hint:** {hint}")

    return "\n".join(parts)


def convert():
    quiz_files = sorted(glob.glob(os.path.join(INPUT_DIR, "quiz-*.json")))
    all_questions = []
    seen_texts = set()  # Deduplicate
    skipped_dup = 0
    skipped_topic = 0

    for quiz_idx, filepath in enumerate(quiz_files):
        with open(filepath, encoding="utf-8") as f:
            data = json.load(f)

        quiz_title = data.get("title", "")

        for q_idx, q in enumerate(data["questions"]):
            q_text = q["question"]

            # Deduplicate by question text (normalized)
            norm = re.sub(r'\s+', ' ', q_text.strip().lower())
            if norm in seen_texts:
                skipped_dup += 1
                continue
            seen_texts.add(norm)

            options = q.get("answerOptions", [])
            hint = q.get("hint", "")
            options_text = " ".join(o.get("text", "") + " " + o.get("rationale", "") for o in options)

            # Classify topics
            topics = classify_topic(q_text, options_text, hint, quiz_title)
            if not topics:
                skipped_topic += 1
                continue

            # Find correct answer index
            correct_idx = 0
            for i, opt in enumerate(options):
                if opt.get("isCorrect"):
                    correct_idx = i
                    break

            # Build CryptoEx MCQ
            mcq = {
                "id": make_id(quiz_idx, q_idx, q_text),
                "type": "mcq",
                "topics": topics,
                "source": {"type": "generated", "label": "NotebookLM"},
                "difficulty": estimate_difficulty(q_text, options, hint),
                "text": q_text,
                "options": [
                    {"key": OPTION_KEYS[i], "text": opt["text"]}
                    for i, opt in enumerate(options)
                    if i < len(OPTION_KEYS)
                ],
                "correctAnswer": OPTION_KEYS[correct_idx],
                "solution": build_solution(options, hint),
            }
            all_questions.append(mcq)

    # Write output
    os.makedirs(os.path.dirname(OUTPUT_FILE), exist_ok=True)
    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        json.dump(all_questions, f, indent=2, ensure_ascii=False)

    # Summary
    topic_counts: dict[str, int] = {}
    for q in all_questions:
        for t in q["topics"]:
            topic_counts[t] = topic_counts.get(t, 0) + 1

    print(f"Converted: {len(all_questions)} questions")
    print(f"Skipped (duplicates): {skipped_dup}")
    print(f"Skipped (no topic match): {skipped_topic}")
    print(f"\nPer topic:")
    for t in sorted(topic_counts.keys()):
        print(f"  {t}: {topic_counts[t]}")


if __name__ == "__main__":
    convert()
