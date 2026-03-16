import { Topic } from "@/types";

export const topics: Topic[] = [
  {
    id: "number-theory-basics",
    name: "Tallteori – grunnleggende",
    lecture: "L-1",
    description: "Divisjon, mod, GCD, Euklids algoritme, kongruenser",
  },
  {
    id: "classical-encryption",
    name: "Klassisk kryptering",
    lecture: "L-2",
    description: "Caesar, Vigenère, substitusjonschiffer, frekvensanalyse",
  },
  {
    id: "hill-stream-otp",
    name: "Hill, strømchiffer & OTP",
    lecture: "L-3",
    description: "Hill-chiffer, LFSR, RC4, one-time pad, perfekt sikkerhet",
  },
  {
    id: "block-ciphers",
    name: "Blokkchiffer",
    lecture: "L-4",
    description: "DES, AES, Feistel-struktur, S-bokser, nøkkelskjema",
  },
  {
    id: "encryption-modes",
    name: "Krypteringsmoduser",
    lecture: "L-5",
    description: "ECB, CBC, CTR, OFB, CFB, padding",
  },
  {
    id: "hashes-macs",
    name: "Hash & MAC",
    lecture: "L-6",
    description: "SHA, HMAC, bursdagsangrep, Merkle-Damgård, kollisjonsmotstand",
  },
  {
    id: "number-theory-pk",
    name: "Tallteori for offentlig nøkkel",
    lecture: "L-7",
    description: "Eulers funksjon, Fermats teorem, kinesisk restteorem, primitiv rot",
  },
  {
    id: "public-key-rsa",
    name: "Offentlig nøkkel & RSA",
    lecture: "L-8",
    description: "RSA kryptering/signering, nøkkelgenerering, Diffie-Hellman, ElGamal",
  },
  {
    id: "discrete-log-crypto",
    name: "Diskret-log-kryptosystemer",
    lecture: "L-9",
    description: "Diffie-Hellman, ElGamal-kryptering, elliptiske kurver, ECDH",
  },
  {
    id: "digital-signatures",
    name: "Digitale signaturer",
    lecture: "L-10",
    description: "RSA-signaturer, ElGamal, Schnorr, DSA, ECDSA, ikke-benekting",
  },
  {
    id: "key-establishment",
    name: "Nøkkeletablering",
    lecture: "L-11",
    description: "Nøkkelutveksling, sertifikater, PKI, Diffie-Hellman-protokoller",
  },
  {
    id: "quantum-safe",
    name: "Kvanteresistent kryptografi",
    lecture: "L-12",
    description: "Kvantedatamaskiner, Shor, Grover, gitterbasert krypto, post-quantum",
  },
  {
    id: "tls",
    name: "TLS",
    lecture: "L-13",
    description: "TLS 1.2, handshake, sertifikater, chiffer-suiter",
  },
  {
    id: "tls13-ipsec",
    name: "TLS 1.3 & IPsec",
    lecture: "L-14",
    description: "TLS 1.3 endringer, IPsec, ESP, AH, IKE",
  },
  {
    id: "email-messaging-security",
    name: "E-post & meldingssikkerhet",
    lecture: "L-15",
    description: "PGP, S/MIME, Signal-protokollen, end-to-end-kryptering",
  },
];

export const topicMap = new Map(topics.map((t) => [t.id, t]));
