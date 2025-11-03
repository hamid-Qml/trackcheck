SYSTEM_TEMPLATE = """TRAKCHEK — GPT-4o FEEDBACK PROMPT (V2.1)
You are simultaneously:
- A senior music producer and mixing/mastering engineer specialized in {genre}
- A label A&R / creative director evaluating originality & market fit

You’ve just listened to a full-length track submitted to TrackCheck, an AI feedback platform for electronic music producers.

Your job: provide brutally honest but constructive feedback in 4 categories (Mix Quality, Arrangement, Creativity, Suggestions for Improvement).
Each section must include a score/100, a 2–3 sentence technical summary, and 3 specific bullet-point recommendations.
Use precise, pro-level language.
Always reference audible elements (vocals, synths, drops, transitions, FX, stereo width, etc.) based on the supplied analysis.
"""

USER_TEMPLATE = """The user uploaded a track.

Genre: {genre}
They requested feedback focused on: {feedback_type}

Extracted Audio Data:
- Tempo: {tempo}
- Key: {key}
- Duration: {duration} seconds
- Loudness: Peak RMS = {peak_rms}
- Spectral Analysis:
  - Spectral Centroid = {centroid} Hz
  - Rolloff = {rolloff} Hz
  - Bandwidth = {bandwidth} Hz
- Dynamics & Energy Profile: {energy_profile}
- Transients: {transients_info}
- Vocal Sections: {vocal_timestamps}
- Drop Timestamps: {drop_timestamps}
- Notable FX / Transitions: {fx_and_transitions}
- Structure Detected: {structure}
{reference_block}
{note_block}

OUTPUT FORMAT
Mix Quality (Score/100)
[2–3 sentences on clarity, punch, frequency balance, loudness]
Key Recommendations:
- [bullet 1]
- [bullet 2]
- [bullet 3]

Arrangement (Score/100)
[2–3 sentences on arrangement/flow]
Key Recommendations:
- [bullet 1]
- [bullet 2]
- [bullet 3]

Creativity (Score/100)
[2–3 sentences on sound design/innovation]
Key Recommendations:
- [bullet 1]
- [bullet 2]
- [bullet 3]

Suggestions for Improvement (Score/100)
[2–3 sentences summarizing high-impact next steps]
Key Recommendations:
- [bullet 1]
- [bullet 2]
- [bullet 3]
"""

def assemble_messages(metadata: dict, *, genre: str, feedback_type: str, user_note: str | None, has_reference: bool):
    reference_block = "Reference track was provided for context." if has_reference else "No reference track was provided."
    note_block = f'User Note: "{user_note}"' if user_note else ""
    system = SYSTEM_TEMPLATE.format(genre=genre)
    user = USER_TEMPLATE.format(
        genre=genre,
        feedback_type=feedback_type,
        reference_block=reference_block,
        note_block=note_block,
        **metadata,
    )
    return [
        {"role": "system", "content": system},
        {"role": "user", "content": user},
    ]
