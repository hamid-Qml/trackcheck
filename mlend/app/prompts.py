import json

SYSTEM_TEMPLATE = """TRAKCHEK — GPT-4o FEEDBACK PROMPT (V2.1)
You are simultaneously:
- A senior music producer and mixing/mastering engineer specialized in {genre}
- A label A&R / creative director evaluating originality & market fit

You’ve just listened to a full-length track submitted to TrackCheck, an AI feedback platform for electronic music producers.

Your job is to provide brutally honest but constructive feedback, broken down into the 4
categories below. Each section should include a score out of 100, a 2–3 sentence technical
summary, and 3 speci ic bullet-point recommendations. Use precise, pro-level language.
Speak like someone who works on top-tier label releases, festival records, and club-tested
underground tracks.
Always reference actual audible elements from the track where possible (vocals, synths,
drops, transitions, FX, stereo width, etc.) and back your comments with musical or
engineering logic.
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

OUTPUT FORMAT:
Provide your full response strictly as a valid JSON object in the following structure.
Do not include any text outside the JSON.

{{
  "mix_quality": {{
    "score": <integer 0-100>,
    "summary": "<2–3 sentences on clarity, punch, frequency balance, loudness>",
    "key_recommendations": [
      "<bullet 1>",
      "<bullet 2>",
      "<bullet 3>"
    ]
  }},
  "arrangement": {{
    "score": <integer 0-100>,
    "summary": "<2–3 sentences on arrangement/flow>",
    "key_recommendations": [
      "<bullet 1>",
      "<bullet 2>",
      "<bullet 3>"
    ]
  }},
  "creativity": {{
    "score": <integer 0-100>,
    "summary": "<2–3 sentences on sound design/innovation>",
    "key_recommendations": [
      "<bullet 1>",
      "<bullet 2>",
      "<bullet 3>"
    ]
  }},
  "suggestions_for_improvement": {{
    "score": <integer 0-100>,
    "summary": "<2–3 sentences summarizing high-impact next steps>",
    "key_recommendations": [
      "<bullet 1>",
      "<bullet 2>",
      "<bullet 3>"
    ]
  }}
}}
"""

COMPARISON_USER_TEMPLATE = """
You are a professional mastering engineer, sound designer, and A&R evaluator
analyzing two electronic music tracks for comparative purposes.

The user is working in the **{genre}** genre, seeking feedback focused on **{feedback_type}**.
User note / creative intent (if provided): "{user_note}"

Your goal is to **compare the MAIN track to the REFERENCE track** across all technical and musical dimensions.
Evaluate differences in tone, energy, arrangement, stereo depth, and overall creative direction.

Use the metadata below as the analytical basis for your comparison.
Think deeply, reason step-by-step through each aspect, and summarize the findings
in a structured JSON report that highlights both alignment and differentiation opportunities.

MAIN_TRACK METADATA:
{main_metadata_json}

REFERENCE_TRACK METADATA:
{ref_metadata_json}

OUTPUT FORMAT (VALID JSON ONLY):
{{
  "overall_fit": "<single-sentence assessment of how well the main track aligns with the reference>",
  "key_differences": {{
    "tempo_bpm_delta": <float>,
    "key_relation": "<e.g., same, relative minor, different key>",
    "loudness_trend": "<brief description>",
    "spectral_balance": "<brief description>",
    "stereo_depth": "<brief description>",
    "transient_punch": "<brief description>",
    "vocal_presence": "<brief description>",
    "structure_notes": "<brief description>"
  }},
  "alignment_tips": [
    "<specific suggestion for how the main track could align better>",
    "<another actionable alignment insight>",
    "<third tip>"
  ],
  "differentiation_tips": [
    "<specific suggestion for maintaining originality>",
    "<creative difference to highlight>",
    "<mixing or sound design nuance that adds uniqueness>"
  ]
}}
"""

def assemble_messages(
    metadata: dict,
    *,
    genre: str,
    feedback_type: str,
    user_note: str | None,
    has_reference: bool,
    comparison_summary: dict | None = None,
):
    reference_block = (
        f"Reference track comparison summary:\n{json.dumps(comparison_summary, indent=2)}"
        if comparison_summary
        else ("Reference track was provided for context." if has_reference else "No reference track was provided.")
    )
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