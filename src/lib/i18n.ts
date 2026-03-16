export type Lang = "en" | "no";

const translations = {
  // Navbar
  "nav.dashboard": { en: "Dashboard", no: "Dashboard" },
  "nav.exam": { en: "Exam", no: "Eksamen" },
  "nav.exercises": { en: "Exercises", no: "Oppgaver" },
  "nav.progress": { en: "Progress", no: "Fremgang" },

  // Dashboard
  "dash.title": { en: "TTM4135 Exam Practice", no: "TTM4135 Eksamenstrening" },
  "dash.mcq_count": { en: "multiple choice questions", no: "flervalgsspørsmål" },
  "dash.written_count": { en: "written questions", no: "skriftlige oppgaver" },
  "dash.attempts_total": { en: "attempts total", no: "forsøk totalt" },

  // Topic card
  "topic.no_questions": { en: "No questions yet", no: "Ingen spørsmål ennå" },
  "topic.mcq": { en: "MCQ", no: "MCQ" },
  "topic.written": { en: "written", no: "skriftlig" },
  "topic.correct": { en: "correct", no: "riktig" },

  // Practice
  "practice.back": { en: "← Dashboard", no: "← Dashboard" },
  "practice.question_of": { en: "Question {0} of {1}", no: "Spørsmål {0} av {1}" },
  "practice.prev": { en: "Previous", no: "Forrige" },
  "practice.next": { en: "Next", no: "Neste" },
  "practice.topic_not_found": { en: "Topic not found.", no: "Tema ikke funnet." },
  "practice.no_questions": {
    en: "No questions for this topic yet.",
    no: "Ingen spørsmål for dette temaet ennå.",
  },
  "practice.back_link": { en: "Back", no: "Tilbake" },

  // MCQ
  "mcq.difficulty": { en: "Difficulty {0}/3", no: "Vanskelighetsgrad {0}/3" },
  "mcq.check": { en: "Check answer", no: "Sjekk svar" },
  "mcq.correct": { en: "Correct!", no: "Riktig!" },
  "mcq.incorrect": { en: "Wrong answer", no: "Feil svar" },

  // Written
  "written.points": { en: "{0} points", no: "{0} poeng" },
  "written.show_solution": { en: "Show solution", no: "Vis løsning" },
  "written.save_assessment": { en: "Save self-assessment", no: "Lagre selvvurdering" },
  "written.self_assessment": { en: "Self-assessment", no: "Selvvurdering" },
  "written.self_score": {
    en: "Self-assessment: {0}/{1} points",
    no: "Selvvurdering: {0}/{1} poeng",
  },

  // Exam setup
  "exam.title": { en: "Simulate Exam", no: "Simuler eksamen" },
  "exam.description": {
    en: "TTM4135 format: 30 MCQ (1pt, −0.33 penalty) + 5 written (6pt). Total 60 points, 3 hours.",
    no: "TTM4135-format: 30 flervalg (1 poeng, −0,33 feil) + 5 skriftlige (6 poeng). Totalt 60 poeng, 3 timer.",
  },
  "exam.available": { en: "Available questions", no: "Tilgjengelige spørsmål" },
  "exam.duration": { en: "Duration (minutes)", no: "Varighet (minutter)" },
  "exam.start": { en: "Start exam", no: "Start eksamen" },
  "exam.mcq_written": { en: "{0} MCQ, {1} written", no: "{0} MCQ, {1} skriftlige" },

  // Active exam
  "exam.mcq_answered": { en: "{0}/{1} MCQ answered", no: "{0}/{1} MCQ besvart" },
  "exam.mcq_section": { en: "Multiple choice", no: "Flervalg" },
  "exam.written_section": { en: "Written", no: "Skriftlig" },
  "exam.submit": { en: "Submit exam", no: "Lever eksamen" },
  "exam.written_note": {
    en: "Write your answers on paper. You'll self-assess after submission.",
    no: "Skriv svarene dine på papir. Du vurderer deg selv etter innlevering.",
  },

  // Exam review
  "review.title": { en: "Exam — Review", no: "Eksamen – Gjennomgang" },
  "review.total": { en: "Total score", no: "Totalpoeng" },
  "review.mcq": { en: "Multiple choice", no: "Flervalg" },
  "review.written": { en: "Written", no: "Skriftlig" },
  "review.time_spent": { en: "Time spent", no: "Tid brukt" },
  "review.min": { en: "{0} min", no: "{0} min" },
  "review.correct_incorrect": {
    en: "{0} correct, {1} wrong, {2} unanswered",
    no: "{0} riktige, {1} feil, {2} ubesvart",
  },
  "review.mcq_review": { en: "Multiple Choice — Review", no: "Flervalg – Gjennomgang" },
  "review.written_review": {
    en: "Written — Self-Assessment",
    no: "Skriftlig – Selvvurdering",
  },

  // Progress
  "progress.title": { en: "Progress", no: "Fremgang" },
  "progress.overall_accuracy": { en: "Overall accuracy", no: "Total nøyaktighet" },
  "progress.correct_of": { en: "{0}/{1} correct", no: "{0}/{1} riktige" },
  "progress.exam_sessions": { en: "Exam sessions", no: "Eksamenøkter" },
  "progress.topics_covered": { en: "Topics covered", no: "Tema dekket" },
  "progress.per_topic": { en: "Per topic (weakest first)", no: "Per tema (svakest først)" },
  "progress.not_practiced": { en: "Not practiced yet", no: "Ikke øvd ennå" },
  "progress.exam_history": { en: "Exam history", no: "Eksamenshistorikk" },
  "progress.not_completed": { en: "Not completed", no: "Ikke fullført" },
  "progress.wipe_topic": { en: "Reset", no: "Nullstill" },
  "progress.wipe_topic_confirm": {
    en: "Reset all progress for this topic?",
    no: "Nullstille all fremgang for dette temaet?",
  },
  "progress.wipe": { en: "Wipe all progress", no: "Slett all fremgang" },
  "progress.wipe_confirm": {
    en: "Are you sure? This will permanently delete all your practice history, exam sessions, and topic stats.",
    no: "Er du sikker? Dette sletter permanent all øvingshistorikk, eksamensøkter og temastatistikk.",
  },

  // Exercises
  "exercises.title": { en: "Exercise Sets", no: "Oppgavesett" },
  "exercises.no_sets": { en: "No exercise sets available yet.", no: "Ingen oppgavesett tilgjengelig ennå." },
  "exercises.count": { en: "{0} exercises", no: "{0} oppgaver" },
  "exercises.back": { en: "← Exercises", no: "← Oppgaver" },
  "exercises.set_not_found": { en: "Exercise set not found.", no: "Oppgavesett ikke funnet." },
  "exercises.exercise_of": { en: "Exercise {0} of {1}", no: "Oppgave {0} av {1}" },
  "exercises.show_solution": { en: "Show solution", no: "Vis løsning" },
  "exercises.hide_solution": { en: "Hide solution", no: "Skjul løsning" },

  // Preferences
  "prefs.theme": { en: "Theme", no: "Tema" },
  "prefs.light": { en: "Light", no: "Lys" },
  "prefs.mild": { en: "Mild", no: "Mild" },
  "prefs.dark": { en: "Dark", no: "Mørk" },
  "prefs.lang": { en: "Language", no: "Språk" },
} as const;

export type TranslationKey = keyof typeof translations;

export function t(key: TranslationKey, lang: Lang, ...args: (string | number)[]): string {
  const val = translations[key]?.[lang] ?? key;
  return args.reduce<string>((s, arg, i) => s.replace(`{${i}}`, String(arg)), val);
}

// Topic names per language
export const topicNames: Record<string, { en: string; no: string }> = {
  "number-theory-basics": {
    en: "Number Theory — Basics",
    no: "Tallteori – grunnleggende",
  },
  "classical-encryption": { en: "Classical Encryption", no: "Klassisk kryptering" },
  "hill-stream-otp": {
    en: "Hill, Stream Ciphers & OTP",
    no: "Hill, strømchiffer & OTP",
  },
  "block-ciphers": { en: "Block Ciphers", no: "Blokkchiffer" },
  "encryption-modes": { en: "Encryption Modes", no: "Krypteringsmoduser" },
  "hashes-macs": { en: "Hash & MAC", no: "Hash & MAC" },
  "number-theory-pk": {
    en: "Number Theory for Public Key",
    no: "Tallteori for offentlig nøkkel",
  },
  "public-key-rsa": { en: "Public Key & RSA", no: "Offentlig nøkkel & RSA" },
  "discrete-log-crypto": {
    en: "Discrete Log Cryptosystems",
    no: "Diskret-log-kryptosystemer",
  },
  "digital-signatures": { en: "Digital Signatures", no: "Digitale signaturer" },
  "key-establishment": { en: "Key Establishment", no: "Nøkkeletablering" },
  "quantum-safe": { en: "Quantum-Safe Cryptography", no: "Kvanteresistent kryptografi" },
  tls: { en: "TLS", no: "TLS" },
  "tls13-ipsec": { en: "TLS 1.3 & IPsec", no: "TLS 1.3 & IPsec" },
  "email-messaging-security": {
    en: "Email & Messaging Security",
    no: "E-post & meldingssikkerhet",
  },
};

export const topicDescriptions: Record<string, { en: string; no: string }> = {
  "number-theory-basics": {
    en: "Division, mod, GCD, Euclid's algorithm, congruences",
    no: "Divisjon, mod, GCD, Euklids algoritme, kongruenser",
  },
  "classical-encryption": {
    en: "Caesar, Vigenère, substitution ciphers, frequency analysis",
    no: "Caesar, Vigenère, substitusjonschiffer, frekvensanalyse",
  },
  "hill-stream-otp": {
    en: "Hill cipher, LFSR, RC4, one-time pad, perfect secrecy",
    no: "Hill-chiffer, LFSR, RC4, one-time pad, perfekt sikkerhet",
  },
  "block-ciphers": {
    en: "DES, AES, Feistel structure, S-boxes, key schedule",
    no: "DES, AES, Feistel-struktur, S-bokser, nøkkelskjema",
  },
  "encryption-modes": {
    en: "ECB, CBC, CTR, OFB, CFB, padding",
    no: "ECB, CBC, CTR, OFB, CFB, padding",
  },
  "hashes-macs": {
    en: "SHA, HMAC, birthday attack, Merkle-Damgård, collision resistance",
    no: "SHA, HMAC, bursdagsangrep, Merkle-Damgård, kollisjonsmotstand",
  },
  "number-theory-pk": {
    en: "Euler's function, Fermat's theorem, CRT, primitive root",
    no: "Eulers funksjon, Fermats teorem, kinesisk restteorem, primitiv rot",
  },
  "public-key-rsa": {
    en: "RSA encryption/signing, key generation, Diffie-Hellman, ElGamal",
    no: "RSA kryptering/signering, nøkkelgenerering, Diffie-Hellman, ElGamal",
  },
  "discrete-log-crypto": {
    en: "Diffie-Hellman, ElGamal encryption, elliptic curves, ECDH",
    no: "Diffie-Hellman, ElGamal-kryptering, elliptiske kurver, ECDH",
  },
  "digital-signatures": {
    en: "RSA signatures, ElGamal, Schnorr, DSA, ECDSA, non-repudiation",
    no: "RSA-signaturer, ElGamal, Schnorr, DSA, ECDSA, ikke-benekting",
  },
  "key-establishment": {
    en: "Key exchange, certificates, PKI, Diffie-Hellman protocols",
    no: "Nøkkelutveksling, sertifikater, PKI, Diffie-Hellman-protokoller",
  },
  "quantum-safe": {
    en: "Quantum computers, Shor, Grover, lattice-based crypto, post-quantum",
    no: "Kvantedatamaskiner, Shor, Grover, gitterbasert krypto, post-quantum",
  },
  tls: {
    en: "TLS 1.2, handshake, certificates, cipher suites",
    no: "TLS 1.2, handshake, sertifikater, chiffer-suiter",
  },
  "tls13-ipsec": {
    en: "TLS 1.3 changes, IPsec, ESP, AH, IKE",
    no: "TLS 1.3 endringer, IPsec, ESP, AH, IKE",
  },
  "email-messaging-security": {
    en: "PGP, S/MIME, Signal protocol, end-to-end encryption",
    no: "PGP, S/MIME, Signal-protokollen, end-to-end-kryptering",
  },
};
