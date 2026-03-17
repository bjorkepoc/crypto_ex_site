# TTM4135 Lecture Study Guide

This file is a study-first overview of Lectures 1 through 15 from the course
material in `L-1.pdf` to `L-15.pdf`. The goal is not to copy the slides. The
goal is to explain what each lecture is really about, what matters most, what
people usually find hard, and how the difficult parts fit together.

How to use this guide:

- Start each lecture by reading the "Main point" line.
- Treat "Know cold" as the exam core.
- Spend extra time on "Hard part breakdown". That is where the conceptual load is.
- Use the later lectures as applied versions of the earlier mathematics.

## Lecture 1 - Basic Number Theory, Groups and Finite Fields

### Main point

Lecture 1 builds the mathematical language used by the rest of the course.
Almost every later topic relies on modular arithmetic, inverses, cyclic groups,
or finite-field arithmetic.

### Most important themes

- Divisibility, primes, Euclidean division, and greatest common divisors.
- The Euclidean algorithm and the extended Euclidean algorithm.
- Modular arithmetic and modular inverses.
- Groups, cyclic groups, element order, and generators.
- Finite fields such as `GF(p)` and `GF(2^n)`.
- Boolean algebra and XOR as basic cryptographic operations.

### Know cold

- What `a | b` means, and why primes matter.
- How to compute `gcd(a, b)` using the Euclidean algorithm.
- How back-substitution gives integers `x` and `y` such that `a*x + b*y = gcd(a, b)`.
- Why `a` has an inverse modulo `n` exactly when `gcd(a, n) = 1`.
- The group requirements: closure, associativity, identity, inverse.
- The meaning of the order of a group and the order of an element.
- Why `Z_p*` is special when `p` is prime.
- That XOR is addition modulo 2.

### Hard part breakdown

The first major difficulty is modular inversion. Students often memorize "use
extended Euclid" without seeing why it works. The reason is simple but deep:
if `gcd(a, n) = 1`, then there exist integers `x` and `y` with
`a*x + n*y = 1`. Reducing that equation modulo `n` kills the `n*y` term and
leaves `a*x = 1 mod n`. That means `x` is the inverse of `a` modulo `n`.
So the extended Euclidean algorithm is not a trick. It is a constructive proof
that the inverse exists.

The second hard idea is the jump from ordinary arithmetic to algebraic
structure. A group is not just "numbers with an operation". It is a set where
the operation behaves predictably enough that we can reason about inversion and
repeated application. Cryptography loves cyclic groups because once a generator
`g` exists, every group element can be written as a power of `g`. That turns
group problems into exponent problems, which is exactly what later public-key
crypto uses.

The third hard idea is finite fields. Over `GF(p)`, every nonzero element has a
multiplicative inverse, which is why arithmetic works so cleanly in RSA-style
settings and many number theory examples. Over `GF(2^n)`, the objects are best
thought of as bit strings or polynomials with binary coefficients. Addition is
XOR. Multiplication is polynomial multiplication reduced modulo an irreducible
polynomial. This feels abstract at first, but it becomes practical later in AES.

### What to be able to do after this lecture

- Compute `gcd` values and modular inverses by hand.
- Decide when an inverse exists modulo `n`.
- Explain what a cyclic group is and why generators matter.
- Explain why prime modulus arithmetic behaves better than composite modulus arithmetic.
- Read later crypto formulas without getting lost in the notation.

## Lecture 2 - Classical Encryption Techniques

### Main point

Lecture 2 introduces the basic vocabulary of cryptography and cryptanalysis by
studying old ciphers. The ciphers themselves are weak, but the attack ideas are
still central.

### Most important themes

- Cryptology versus cryptography versus cryptanalysis.
- Confidentiality versus authenticity.
- Symmetric versus asymmetric systems.
- Attack models such as ciphertext-only, known-plaintext, and chosen-plaintext.
- Natural language statistics and why they leak structure.
- Transposition ciphers versus substitution ciphers.
- Caesar, monoalphabetic substitution, and Vigenere.
- Period detection techniques such as Kasiski, autocorrelation, and index of coincidence.

### Know cold

- The difference between transposition and substitution.
- Why English letter frequencies make simple substitution vulnerable.
- Why Caesar is just a tiny key-space substitution cipher.
- Why a random monoalphabetic substitution hides single-letter identities but still leaks language statistics.
- Why Vigenere is stronger than Caesar but still not secure.
- The intuition behind identifying the Vigenere period before solving each Caesar-like stream separately.

### Hard part breakdown

The hard idea here is not the mechanics of Caesar or Vigenere. It is the idea
that encryption can fail even when the key is unknown, simply because the
ciphertext still carries statistical structure from the plaintext. Natural
language is highly non-random: some letters and digrams occur much more often
than others. A substitution cipher preserves those frequencies, only with the
labels renamed. That means the attacker is not guessing the key from nothing.
The attacker is matching patterns.

Vigenere is harder because it mixes several Caesar shifts. At first that seems
to destroy frequency analysis, but it only spreads the leakage across several
positions. If the key has period `d`, then every `d`th character was encrypted
with the same Caesar shift. Once the attacker finds `d`, the problem splits
into `d` smaller substitution problems. This is why period-finding is the real
first step in Vigenere cryptanalysis.

Another important conceptual jump is attack models. The question is not only
"can the scheme be broken?" but also "what does the attacker know or control?"
A known-plaintext attack is much stronger than ciphertext-only. This thinking
reappears later in modern notions such as CPA and CCA security.

### What to be able to do after this lecture

- Classify a cipher as transposition, substitution, or polyalphabetic.
- Explain why language statistics are a security problem.
- Describe how a Vigenere attack proceeds in two phases: find the period, then solve the shifts.
- Use classical ciphers as examples of what modern ciphers must avoid leaking.

## Lecture 3 - Hill Cipher, Stream Ciphers and the One-Time Pad

### Main point

Lecture 3 moves from character-shifting ciphers to algebraic and keystream-based
ciphers. It shows both a mathematically elegant but weak cipher (Hill) and a
perfectly secure but impractical cipher (the one-time pad).

### Most important themes

- The Hill cipher as matrix multiplication modulo 26.
- Why invertibility of the key matrix matters.
- Why linearity is dangerous.
- Stream cipher encryption as `ciphertext = plaintext XOR keystream`.
- The conditions required for one-time pad security.
- Shannon's definition of perfect secrecy.
- Visual cryptography as a different style of secret sharing.

### Know cold

- Hill encryption: `C = K*P` and decryption: `P = K^-1*C`.
- The key matrix must be invertible modulo the alphabet size.
- A known-plaintext attack on Hill can recover `K` by solving linear equations.
- Stream ciphers do not encrypt blocks independently; they generate a keystream.
- OTP is secure only if the key is truly random, as long as the message, secret,
  and never reused.
- Reusing a stream or OTP keystream is catastrophic.

### Hard part breakdown

The Hill cipher is often the first place where students feel the power of
linear algebra in cryptography. It also shows exactly why "mathematical" does
not mean "secure". Because the encryption is linear, enough plaintext-ciphertext
pairs let the attacker solve for the key matrix directly. The attack is not
brute force. It is algebra. That is the lesson: structure helps the attacker if
the structure is too clean.

The one-time pad is hard conceptually because it looks almost too simple. Why
should XOR or modular addition with a random key make the message perfectly
hidden? The reason is that for any observed ciphertext, every plaintext of the
same length is compatible with exactly one key. If the keys are uniformly
random, then seeing the ciphertext does not make any plaintext more likely than
before. That is what perfect secrecy means: observing the ciphertext does not
change the posterior distribution of messages.

The catch is equally important. OTP security depends on brutal operational
requirements. The key must be random, at least as long as the message, shared
securely in advance, and used once. If two messages use the same keystream,
their ciphertexts XOR together to reveal the XOR of the two plaintexts. That is
why stream-cipher nonce reuse later becomes such a serious problem.

### What to be able to do after this lecture

- Encrypt and decrypt short Hill cipher examples.
- Explain why a linear cipher is vulnerable to known-plaintext attacks.
- Explain perfect secrecy in probability terms, not just in slogans.
- Explain why OTP is theoretically ideal and practically awkward.

## Lecture 4 - Block Ciphers, DES and AES

### Main point

Lecture 4 introduces the modern workhorse cipher family: block ciphers. The
core idea is that many rounds of carefully designed confusion and diffusion can
produce a secure permutation on fixed-size blocks.

### Most important themes

- Block ciphers as fixed-size keyed permutations.
- Shannon's confusion and diffusion.
- Product ciphers and iterated ciphers.
- Feistel networks and substitution-permutation networks.
- Avalanche properties.
- Differential and linear cryptanalysis.
- DES design and why its key length became too short.
- Triple DES as an extension of DES.
- AES as the modern standard block cipher.

### Know cold

- What a block cipher does and does not do by itself.
- The difference between Feistel structure and SPN structure.
- Why avalanche matters.
- That DES is structurally clever but key-size limited.
- Why double DES is not the simple fix it appears to be.
- The broad AES round structure: nonlinear substitution, permutation,
  diffusion, and round-key addition.

### Hard part breakdown

The hardest conceptual jump here is seeing why repeated simple rounds can
produce something much stronger than each round alone. One round of substitution
or permutation does not hide much. Many rounds can mix local changes so widely
that tiny input differences become global output differences. That is the
purpose of confusion and diffusion, and avalanche is the symptom that this
mixing is happening.

Feistel and SPN designs can be confusing because both are iterated ciphers, but
they solve reversibility differently. A Feistel network can be inverted even if
the round function itself is not invertible, because half-block swapping and XOR
create a reversible structure. An SPN typically uses invertible steps
throughout. AES is the canonical SPN example.

The other hard idea is that "strong design" and "real security margin" are not
the same thing. DES was a major engineering success, but 56-bit keys became too
small for brute-force security. Triple DES extended its life, but with more
cost. AES replaced it not because DES had totally failed mathematically, but
because practical security and efficiency demanded a stronger standard.

If AES arithmetic feels mysterious, focus on the role of each step. SubBytes
adds nonlinearity. ShiftRows and MixColumns spread local changes across the
state. AddRoundKey injects the secret each round. You do not need to love the
matrix details on day one, but you do need to see how the steps cooperate.

### What to be able to do after this lecture

- Explain confusion, diffusion, and avalanche in plain language.
- Distinguish Feistel and SPN designs.
- Explain why DES is historically important but no longer sufficient.
- Describe the purpose of each main AES round component.

## Lecture 5 - Encryption Modes and PRNGs

### Main point

Lecture 5 explains why a secure block cipher is not enough. How you use the
block cipher matters just as much as which block cipher you choose.

### Most important themes

- Why direct block-by-block encryption leaks patterns.
- Confidentiality modes: ECB, CBC, CFB, OFB, CTR.
- Padding requirements and alternatives.
- Parallelism and error propagation.
- The role of IVs and nonces.
- Random numbers and deterministic random bit generators.
- CTR_DRBG and the Dual_EC_DRBG cautionary example.

### Know cold

- ECB is deterministic and leaks repeated blocks.
- CBC chains each block to the previous ciphertext block and needs a proper IV.
- OFB and CTR turn a block cipher into a keystream generator.
- CTR mode absolutely requires nonce/counter uniqueness under a key.
- Different modes have different operational properties:
  parallelizability, random access, padding, and error propagation.
- A DRBG is deterministic after seeding, which is a feature, not a bug.

### Hard part breakdown

The biggest trap in this lecture is thinking that a secure primitive stays
secure in every wrapper. It does not. ECB can use AES internally and still leak
the visual structure of the plaintext because equal plaintext blocks produce
equal ciphertext blocks. That is why modes exist in the first place: to add
randomness, chaining, or state.

The second hard idea is that IV and nonce requirements are mode-specific. In
CBC, the IV should be unpredictable or at least fresh enough that the first
block does not become deterministic in a dangerous way. In CTR, the nonce does
not need to be secret, but it must never repeat with the same key, because
repetition causes keystream reuse. Once that happens, XORing ciphertexts leaks
the XOR of plaintexts, just like stream-cipher reuse.

CTR mode is especially important conceptually. It encrypts a sequence of
counter blocks and uses the outputs as keystream. That means encryption and
decryption are both just XOR with a keystream. It is fast, parallel, and clean,
but it moves all safety onto nonce management. The mathematics is simple; the
operations discipline is the hard part.

The DRBG section is a reminder that random number generation is part of
cryptographic security, not a side detail. Dual_EC_DRBG became famous because a
standard can be technically published and still inspire deep distrust if its
structure appears to enable a hidden trapdoor.

### What to be able to do after this lecture

- Pick a suitable confidentiality mode and justify the choice.
- Explain why ECB is bad even with a strong cipher.
- Explain the difference between IV unpredictability and nonce uniqueness.
- Explain why bad randomness can break otherwise sound designs.

## Lecture 6 - Hashes and MACs

### Main point

Lecture 6 shifts from confidentiality to integrity and authentication. Hashes
compress data; MACs authenticate data; authenticated encryption aims to do both
at once.

### Most important themes

- Hash functions and their core security properties.
- Collision resistance, preimage resistance, second-preimage resistance.
- The birthday bound.
- Iterated hashing and Merkle-Damgard.
- Standardized hash families and broken historical ones.
- Password hashing with salts.
- Message authentication codes and HMAC.
- Authenticated encryption and GCM.

### Know cold

- The exact difference between collision resistance and preimage resistance.
- Why `n`-bit collision security is roughly `2^(n/2)`, not `2^n`.
- Why Merkle-Damgard supports long inputs but introduces structural attacks.
- Why hashing a password alone is not enough; salts matter.
- Why a plain hash does not give authentication.
- Why HMAC is stronger than the naive "hash(key || message)" approach.
- Why authenticated encryption is preferable to bare encryption.

### Hard part breakdown

The three hash security notions are easy to mix up. Preimage resistance asks:
given a digest `y`, can you find any `x` with `H(x) = y`? Second-preimage asks:
given one specific `x1`, can you find a different `x2` with the same digest?
Collision resistance asks for any pair `x1 != x2` with equal digest. The last
one is usually the strongest practical notion because the attacker gets more
freedom.

The birthday paradox matters because it changes the scale of collision attacks.
If a hash has `k` output bits, you do not need around `2^k` work for a
collision; around `2^(k/2)` random tries already give a constant collision
probability. That is why 256-bit outputs are commonly used when collision
resistance matters.

HMAC is one of the most exam-important constructions in the whole course. The
key idea is that HMAC wraps the hash twice with different pad constants and a
key-derived block. This prevents the structural problems that naive keyed hashes
can have, including Merkle-Damgard length-extension style abuse. You do not
need to derive the proof, but you do need to understand that HMAC is not just
"a hash with a secret stuck on".

GCM is hard because it combines two ideas: CTR-mode encryption for
confidentiality and a polynomial-style authenticator over a finite field for
integrity. Operationally, the big rule is nonce uniqueness. Reusing a GCM nonce
under the same key is dangerous for both confidentiality and integrity.

### What to be able to do after this lecture

- State and distinguish the three main hash security properties.
- Explain why collision security scales with the birthday bound.
- Explain why HMAC is a MAC and a plain hash is not.
- Explain what authenticated encryption is trying to achieve.

## Lecture 7 - Number Theory for Public-Key Crypto

### Main point

Lecture 7 turns basic number theory into public-key machinery. It connects
modular arithmetic to prime generation and to the hardness assumptions used by
RSA and discrete-log systems.

### Most important themes

- Chinese remainder theorem (CRT).
- Euler's phi function.
- Fermat's little theorem and Euler's theorem.
- Primality testing.
- Fermat primality test and Carmichael numbers.
- Miller-Rabin testing.
- Basic complexity thinking.
- Factorization and discrete logarithm as computational problems.

### Know cold

- How CRT combines congruences modulo pairwise coprime moduli.
- Basic phi values, especially for primes and products of distinct primes.
- The statements and use cases of Fermat and Euler.
- Why Fermat testing alone is not reliable.
- What Carmichael numbers show.
- The broad Miller-Rabin procedure and why it is much better in practice.
- That "probably prime" can still be good enough when the error is tiny.

### Hard part breakdown

CRT is conceptually beautiful because it says that arithmetic modulo a composite
number with coprime factors can be decomposed into arithmetic modulo the factors.
That is not just a theorem to memorize. It is the reason CRT-based speedups work
later in RSA. It lets you solve one problem by solving several smaller ones and
then recombining them.

Miller-Rabin is the hardest part of this lecture for most people. The point is
to catch composites that sneak past Fermat-style tests. Write `n - 1 = 2^v * u`
with `u` odd. Then examine powers of a random base `a`. If `n` were prime, the
sequence of squarings has very restricted behavior: it can hit `1` only in
certain safe ways, and if it reaches `1` from something other than `+1` or `-1`
mod `n`, that exposes a nontrivial square root of `1`, which cannot happen for
prime `n`. That is the intuition behind the test.

The deeper lesson is that public-key crypto depends on a chain:
efficient arithmetic, efficient prime generation, and hard inverse problems. If
any of those links were missing, modern public-key systems would not be usable.

### What to be able to do after this lecture

- Solve small CRT exercises.
- Compute phi for standard forms of `n`.
- Explain why Fermat is insufficient and Miller-Rabin is preferred.
- Explain why factoring and discrete log are useful as one-way candidates.

## Lecture 8 - Public Key Cryptography and the RSA Scheme

### Main point

Lecture 8 introduces the public-key idea and then studies RSA as the canonical
example of trapdoor computation.

### Most important themes

- One-way and trapdoor one-way functions.
- Why public-key crypto solves key-distribution problems.
- Hybrid encryption.
- RSA key generation and operations.
- Efficient exponentiation and CRT speedups.
- Padding, especially OAEP-style thinking.
- Security relation to factorization.
- Side-channel attacks on implementations.

### Know cold

- Public key for encryption, private key for decryption.
- RSA key generation:
  choose large primes `p, q`, set `n = p*q`, compute `phi(n)`,
  choose `e`, compute `d = e^-1 mod phi(n)`.
- Encryption: `c = m^e mod n`.
- Decryption: `m = c^d mod n`.
- Why public-key encryption is usually used only to transport a symmetric key.
- The purpose of square-and-multiply.
- Why raw RSA must be padded.

### Hard part breakdown

The most important conceptual point is why RSA decryption works at all. The
secret is the relation `e*d = 1 mod phi(n)`. That means `e*d = 1 + k*phi(n)` for
some integer `k`. Euler's theorem then says powers collapse in exactly the right
way so that raising a ciphertext to the power `d` reverses raising the message
to the power `e`. If you do not see that link between number theory and the
scheme, RSA feels like magic. It is not magic; it is modular arithmetic plus a
trapdoor.

The second hard idea is that textbook RSA is not semantically secure. It is
deterministic: the same plaintext under the same key gives the same ciphertext.
That means attackers can test guesses and exploit algebraic structure. Padding
schemes such as OAEP randomize the encoding before exponentiation so that the
encryption behaves like a proper modern public-key scheme.

The third hard idea is implementation leakage. RSA can be mathematically sound
and still fail if timing, power, or fault behavior reveals the private exponent.
Square-and-multiply is especially instructive because the pattern of multiplies
can depend on exponent bits. Constant-time techniques, blinding, and careful
engineering matter because attackers do not have to break the math if the device
betrays the key.

### What to be able to do after this lecture

- Carry out toy RSA key generation and encryption/decryption.
- Explain why hybrid encryption is standard practice.
- Explain why padding is required.
- Explain the difference between breaking RSA mathematically and leaking it through implementation.

## Lecture 9 - Discrete Log Public Key Cryptosystems

### Main point

Lecture 9 studies the other main public-key family: systems based on discrete
logarithms rather than factorization.

### Most important themes

- Diffie-Hellman key exchange.
- Computational assumptions behind DH-style systems.
- The man-in-the-middle problem and authentication.
- Static versus ephemeral keys.
- ElGamal encryption.
- Elliptic curves and elliptic-curve cryptography.

### Know cold

- How plain Diffie-Hellman works:
  Alice sends `g^a`, Bob sends `g^b`, both derive `g^(ab)`.
- Why the protocol gives confidentiality but not identity by itself.
- Why authenticated DH adds signatures or another binding mechanism.
- The high-level ElGamal idea: randomness plus group multiplication.
- Why elliptic-curve versions usually achieve the same security with smaller keys.

### Hard part breakdown

The most important conceptual point is that Diffie-Hellman is a key-agreement
protocol, not an authentication protocol. Students often think "the math is
correct, so the protocol is secure". But if an attacker can sit between the
parties, the attacker can run one DH exchange with Alice and another with Bob,
then relay traffic. No secret math is broken. The failure is missing identity
binding.

ElGamal is worth understanding as a "DH turned into encryption" intuition. A
fresh random exponent creates an ephemeral public value, and that fresh value is
combined with the receiver's public key to mask the message. The reason this is
better than textbook RSA from a confidentiality perspective is that ElGamal is
naturally randomized.

Elliptic curves are usually the hardest new object in the course. You do not
need full algebraic geometry. The key thing is that the points on a carefully
chosen curve form a group, and the hard problem is scalar multiplication in
reverse: given `P` and `Q = [k]P`, find `k`. That is the elliptic-curve
discrete-log problem. Because the best known attacks are worse than the best
known attacks on finite-field DH at equal parameter size, ECC gives smaller keys
for the same security level.

### What to be able to do after this lecture

- Explain DH clearly and identify its missing authentication property.
- Explain why ephemeral keys help with forward secrecy.
- Describe ElGamal at a high level.
- Explain why ECC is attractive in practice.

## Lecture 10 - Digital Signatures

### Main point

Lecture 10 turns public-key ideas from confidentiality into authenticity,
integrity, and non-repudiation.

### Most important themes

- What digital signatures guarantee.
- Why signatures are different from MACs.
- Security notions such as existential forgery under chosen-message attack.
- RSA signatures.
- Discrete-log signatures: ElGamal, Schnorr, DSA, ECDSA.
- The role of hashing before signing.
- The importance of good randomness in nonce-based signatures.

### Know cold

- A signature scheme has key generation, signing, and verification.
- Signatures are publicly verifiable; MACs are not.
- Modern security aims at resisting existential forgery under chosen-message attack.
- RSA signatures sign a hash-derived value, not the whole message directly.
- Schnorr/DSA/ECDSA-style schemes depend critically on nonce quality.

### Hard part breakdown

The easiest mistake in this lecture is to treat signatures as "public-key MACs".
They are related, but the public-verification property changes everything. With
a MAC, every verifier must know the shared secret, so no verifier can later
prove which party created the tag. With signatures, anyone can verify using the
public key, but only the signer should be able to produce the signature. That is
why signatures enable non-repudiation.

The security notion of existential forgery under chosen-message attack sounds
technical, but it captures the real danger. We do not only care whether an
attacker can forge the exact message they want. We care whether the attacker can
produce any new valid signature after interacting with the signer on messages of
their choice. If the answer is yes, the scheme is broken.

For DSA-, Schnorr-, and ECDSA-style signatures, the hardest operational lesson
is nonce reuse. These schemes mix the secret signing key with a fresh random
nonce in a way that can often be algebraically inverted if the nonce repeats or
is biased. This is one of the most realistic real-world signature failure modes.

### What to be able to do after this lecture

- Explain how signatures differ from MACs.
- Describe the main security goal for a modern signature scheme.
- Explain at a high level how RSA and discrete-log signatures differ.
- Explain why bad nonce generation can destroy signature security.

## Lecture 11 - Key Establishment and Certificates

### Main point

Lecture 11 studies how cryptographic primitives are combined into protocols that
actually establish session keys between real systems.

### Most important themes

- Key management life cycle.
- Long-term, ephemeral, and session keys.
- Authentication and confidentiality as protocol goals.
- Key pre-distribution, key transport, and key agreement.
- Public-key and symmetric-key establishment methods.
- Certificates and PKI.
- Needham-Schroeder and replay attacks.
- Kerberos and ticket-based authentication.

### Know cold

- Why session keys should be fresh.
- Why long-term keys and session keys serve different roles.
- The difference between transport and agreement.
- What a certificate is doing in a protocol.
- Why replay attacks are a protocol problem, not a cipher problem.
- How timestamps, counters, and nonces provide freshness.
- The basic purpose of tickets in Kerberos.

### Hard part breakdown

Protocol lectures are hard because the question is no longer only "can the
attacker compute the key?" It becomes "who believes what, and why are they
justified?" A party can finish a protocol and still be wrong about who shares
the key with them. That is why authentication in protocol analysis is subtle.

Needham-Schroeder is a classic because it shows how a design can look sensible
and still fail under replay. If an old session key is compromised, replaying old
messages can trick one side into accepting the old key again unless freshness is
built in. The fix is not stronger encryption. The fix is evidence that the key
is new for this run.

Certificates are another conceptual jump. A certificate does not make a public
key magically true. It binds an identity to a public key with a signature from
an authority the verifier already trusts. PKI is therefore a trust-management
system layered on top of signatures.

Kerberos is hard because it is multi-stage. The user first proves themselves to
an authentication service, then gets a ticket-granting capability, then uses
service tickets to talk to individual services. The gain is single sign-on. The
cost is complexity and reliance on the KDC infrastructure.

### What to be able to do after this lecture

- Explain freshness and replay resistance.
- Explain the difference between authentication and confidentiality in a protocol.
- Explain what certificates and PKI contribute.
- Describe the high-level flow of Kerberos.

## Lecture 12 - Quantum-Safe Cryptography

### Main point

Lecture 12 explains why quantum computing threatens today's public-key systems
and introduces the main families being standardized to replace them.

### Most important themes

- Shor's algorithm and its impact on RSA and discrete-log systems.
- Grover's algorithm and its weaker impact on symmetric cryptography.
- "Harvest now, decrypt later" as a deployment concern.
- Lattice-style assumptions such as LWE and SIS.
- KEMs and post-quantum signatures.
- ML-KEM (Kyber) and ML-DSA (Dilithium).
- Hybrid migration strategies.

### Know cold

- Quantum danger mainly targets public-key crypto first.
- Symmetric crypto is not broken in the same way; parameters are often just increased.
- Why long-term confidentiality motivates migration before large quantum computers exist.
- What a KEM does:
  key generation, encapsulation, decapsulation.
- That LWE and SIS are very different kinds of hardness assumptions than factoring and discrete log.
- Why hybrid deployment is attractive during transition.

### Hard part breakdown

The first hard idea is strategic, not mathematical: migration is urgent even
before a practical cryptanalytically relevant quantum computer exists, because
adversaries can store ciphertext now and decrypt it later. If today's traffic
needs to stay secret for many years, "secure today, broken later" is not good
enough.

The second hard idea is what quantum actually changes. Shor's algorithm is
devastating for factoring and discrete logarithms, so RSA, DH, ECDH, DSA, and
ECDSA are all in trouble in a full-scale quantum world. Grover's algorithm is
different: it gives a square-root speedup for brute force, so symmetric systems
mostly need longer keys and hash outputs rather than complete replacement.

LWE and SIS are hard because they do not look like the number theory problems
you already know. The intuition for LWE is that linear equations become hard to
solve when small noise is mixed in carefully. The intuition for SIS is that you
must find a short nonzero vector satisfying a modular linear relation. You do
not need the full reductions for exam purposes, but you do need to understand
that post-quantum schemes are built on very different hardness landscapes.

Hybrid deployment is conceptually important. A hybrid handshake usually combines
classical and post-quantum contributions so that the session remains secure
unless both components fail. This is a practical migration pattern, not just a
theoretical compromise.

### What to be able to do after this lecture

- Explain why public-key crypto is the first major quantum casualty.
- Explain why "harvest now, decrypt later" matters.
- Explain the basic idea of a KEM.
- Explain why hybrid deployments are a sensible transitional design.

## Lecture 13 - Transport Layer Security

### Main point

Lecture 13 studies TLS as a real deployed protocol that combines many course
primitives into one complicated system.

### Most important themes

- TLS history from SSL to TLS 1.2 and TLS 1.3.
- TLS architecture: handshake, record, alert, change cipher spec.
- Cipher suites and what they specify.
- Record-layer confidentiality and integrity.
- Handshake-based key establishment and authentication.
- Real-world attacks on TLS.

### Know cold

- TLS is a protocol family, not just a cipher.
- The handshake sets up keys and authenticates peers; the record layer protects data.
- Cipher suites name both handshake choices and record protection choices.
- TLS 1.2 widely used signed (EC)DHE for key exchange plus symmetric record protection.
- Many practical TLS failures were due to downgrade, padding, compression, or implementation bugs.

### Hard part breakdown

The hardest conceptual issue is separating the roles of the sub-protocols. The
handshake establishes shared secrets and authenticates the server, sometimes the
client. The record layer then uses symmetric cryptography to protect bulk data.
If you blur those layers together, TLS diagrams become impossible to reason
about.

The second hard lesson is that attacks on TLS often do not mean "AES was
broken". BEAST exploited CBC IV behavior. CRIME and BREACH exploited
compression side channels. POODLE exploited downgrade plus padding-oracle
behavior. Lucky 13 exploited timing leakage. Heartbleed was an implementation
bounds-check failure, not a failure of the cryptographic design. This lecture is
really about how secure primitives can still fail inside a large system.

Backward compatibility is another recurring difficulty. Old protocol versions,
legacy cipher suites, and downgrade paths create attack surface. TLS is a
perfect case study in why deployed security is messier than textbook security.

### What to be able to do after this lecture

- Describe the difference between the TLS handshake and record layer.
- Read a cipher suite name and explain its components.
- Explain how several famous TLS attacks worked at a high level.
- Explain why protocol evolution and deprecation matter.

## Lecture 14 - TLS 1.3 and IP Security

### Main point

Lecture 14 shows how TLS 1.3 simplified and strengthened TLS, then compares TLS
with IPsec as a lower-layer approach to secure communication.

### Most important themes

- Why TLS 1.3 removed legacy features.
- One-RTT-style handshake improvements.
- HKDF-based key schedule and multiple traffic key types.
- 0-RTT early data and its trade-offs.
- IPsec goals and where it sits in the stack.
- ESP versus AH.
- IKEv2 and Security Associations.
- Transport mode versus tunnel mode.

### Know cold

- TLS 1.3 removes static RSA/DH, renegotiation, compression, and non-AEAD suites.
- TLS 1.3 always uses ephemeral Diffie-Hellman style key exchange.
- Most handshake messages are protected earlier than in TLS 1.2.
- 0-RTT improves latency but does not give the same security as full fresh-handshake data.
- ESP gives confidentiality plus integrity/authentication; AH does not give confidentiality and is largely deprecated.
- A Security Association tells an IPsec endpoint how to process traffic.
- Transport mode protects payload in host-to-host style; tunnel mode wraps the entire original packet and is common gateway-to-gateway.

### Hard part breakdown

TLS 1.3 is best understood as a deliberate cleanup. Earlier TLS versions
accumulated options that created too much complexity and too many dangerous
legacy paths. TLS 1.3 aggressively removes weak or awkward features and makes
ephemeral key agreement the default. That improves both forward secrecy and
implementation clarity.

0-RTT is conceptually tricky. It lets a client send early data before the full
handshake completes when resuming with a pre-shared context. That helps
performance, but the early data does not enjoy the same freshness and replay
resistance properties as ordinary application data under a full handshake.
So 0-RTT is a performance feature with careful usage limits, not a free win.

IPsec is hard because it lives at a different layer than TLS. TLS secures
applications and usually terminates at the endpoint application context. IPsec
secures IP packets and can protect host-to-host or gateway-to-gateway traffic
without application awareness. A Security Association is basically the
connection state telling each side which algorithms, keys, and identifiers to
use. Because SAs are directional, a full bidirectional setup uses separate
state in each direction.

### What to be able to do after this lecture

- Explain the major security differences between TLS 1.2 and TLS 1.3.
- Explain why 0-RTT is useful and why it is risky.
- Explain the roles of ESP, AH, IKEv2, and SAs.
- Explain transport versus tunnel mode.

## Lecture 15 - Email Security and Secure Messaging

### Main point

Lecture 15 compares two real-world communication settings that look similar from
far away but have very different security models: email and instant messaging.

### Most important themes

- Email architecture and threat surface.
- Link security versus end-to-end security.
- STARTTLS and downgrade issues.
- DKIM and domain-level authentication.
- PGP/OpenPGP and S/MIME.
- Web of trust versus CA-based trust.
- Usability problems in secure email.
- Messaging security goals such as forward secrecy and post-compromise security.
- Signal-style ratcheting and post-quantum secure messaging.

### Know cold

- Email metadata and routing create privacy limits even when content is protected.
- STARTTLS protects links, not end-to-end content.
- DKIM authenticates sending domains, not necessarily individual humans.
- PGP/OpenPGP and S/MIME both aim for end-to-end protection, but they differ in trust model.
- PGP's web of trust is decentralized; S/MIME uses CA-backed X.509 certificates.
- Forward secrecy is especially important for long-lived messaging.
- Ratcheting continuously updates keys so compromise does not expose everything forever.

### Hard part breakdown

The core conceptual split is link security versus end-to-end security. STARTTLS
can protect one hop between mail servers, but email often passes through several
servers and is stored at endpoints. So link encryption is valuable but does not
solve the full confidentiality problem. DKIM is also useful, but it proves that
a domain authorized the message, not that the human sender is who they claim to
be in every meaningful sense.

PGP and S/MIME aim at end-to-end security, but deployment is hard. PGP's web of
trust is flexible but operationally difficult. S/MIME fits existing PKI models
better but depends on certificate ecosystems and client support. Both systems
also suffer from usability friction, which is one reason secure email adoption
has historically lagged behind the theory.

Secure messaging takes a different path. It assumes interactive conversations
and can refresh keys continuously. Signal's ratchet is the key idea: derive a
new message key very frequently, and mix in new Diffie-Hellman material over
time. That gives forward secrecy and a measure of post-compromise recovery. If
an attacker steals state now, that should not automatically expose old messages,
and future updates can help heal the session later.

The post-quantum extension matters because messaging is a classic
"harvest-now-decrypt-later" target. A protocol such as PQXDH tries to add a
post-quantum contribution to the initial key establishment while keeping the
system practical during transition.

### What to be able to do after this lecture

- Distinguish link protection from end-to-end protection.
- Explain what STARTTLS and DKIM do, and what they do not do.
- Compare PGP and S/MIME trust models.
- Explain forward secrecy, post-compromise security, and ratcheting in messaging.

## Cross-Lecture Synthesis

The course has a clear arc:

- Lectures 1 to 3 build the language of modular arithmetic, groups, statistics,
  linearity, and perfect secrecy.
- Lectures 4 to 6 show how modern symmetric cryptography gets confidentiality,
  integrity, and authentication right.
- Lectures 7 to 10 build public-key crypto from number theory, hard problems,
  key exchange, and signatures.
- Lectures 11 to 15 show how those primitives become real protocols and systems.

If you want the shortest list of concepts that connect everything, focus on
these:

- Modular arithmetic and inverses.
- Randomness, nonces, IVs, and freshness.
- The difference between confidentiality, integrity, authentication,
  and non-repudiation.
- The difference between primitives and protocols.
- The fact that many real attacks exploit misuse, leakage, downgrade, or bad
  system design rather than directly "breaking AES" or "breaking RSA".

## Highest-Priority Difficult Topics to Revisit

If you want a short list of the topics most worth revisiting slowly, pick these:

1. Extended Euclidean algorithm and modular inverses.
2. Cyclic groups, generators, and finite fields.
3. Vigenere period detection and frequency reasoning.
4. Why Hill cipher linearity enables key recovery.
5. Feistel versus SPN, and the role of confusion/diffusion.
6. IV/nonce rules in CBC, CTR, and GCM.
7. Collision versus preimage versus second-preimage resistance.
8. HMAC and why it is not just "hash with a key".
9. Miller-Rabin and nontrivial square roots of 1.
10. Why RSA needs padding and constant-time implementation.
11. Why Diffie-Hellman needs authentication.
12. Why nonce reuse destroys DSA/ECDSA-style signatures.
13. Freshness, replay protection, and certificate trust.
14. Why post-quantum migration cannot wait for a perfect future date.
15. Why TLS and messaging failures are often protocol or implementation failures.
