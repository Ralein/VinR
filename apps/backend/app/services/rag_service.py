"""RAG Service — Curated mental health knowledge base.

Ships with ~20 evidence-based knowledge snippets from NIMH, APA,
SAMHSA, Mayo Clinic. Uses keyword matching for retrieval.
Upgrade to pgvector embeddings in a future sprint.
"""

from typing import List

# Curated knowledge chunks — sourced from public US government
# and validated medical institution resources.
KNOWLEDGE_BASE: List[dict] = [
    {
        "id": "nimh-anxiety-1",
        "topic": "anxiety",
        "keywords": ["anxious", "worry", "nervous", "panic", "fear", "stress", "overwhelmed"],
        "content": (
            "Anxiety disorders are the most common mental health condition, affecting 40 million adults. "
            "Evidence-based techniques include Cognitive Behavioral Therapy (CBT), deep breathing exercises "
            "(which activate the parasympathetic nervous system), and progressive muscle relaxation. "
            "Regular physical activity reduces anxiety symptoms by 20-30%."
        ),
        "source": "NIMH (nimh.nih.gov)",
    },
    {
        "id": "apa-breathing-1",
        "topic": "breathing",
        "keywords": ["anxious", "panic", "stress", "overwhelmed", "breathing", "calm"],
        "content": (
            "Diaphragmatic breathing (belly breathing) has been shown to reduce cortisol levels by up to 50%. "
            "The 4-7-8 technique (inhale 4s, hold 7s, exhale 8s) was developed by Dr. Andrew Weil and "
            "activates the vagus nerve, shifting the body from fight-or-flight to rest-and-digest mode."
        ),
        "source": "APA (apa.org)",
    },
    {
        "id": "mayo-depression-1",
        "topic": "depression",
        "keywords": ["sad", "depressed", "hopeless", "empty", "lonely", "numb", "tired"],
        "content": (
            "Depression is a medical condition, not a character flaw. Exercise is as effective as "
            "antidepressant medication for mild to moderate depression. Even a 10-minute walk can "
            "boost mood by increasing endorphin and serotonin levels. Behavioral activation — "
            "scheduling small, pleasurable activities — is a core CBT technique."
        ),
        "source": "Mayo Clinic (mayoclinic.org)",
    },
    {
        "id": "nimh-depression-2",
        "topic": "depression",
        "keywords": ["sad", "depressed", "hopeless", "crying", "lost", "worthless"],
        "content": (
            "Social connection is a powerful antidepressant. Research shows that even brief social "
            "interactions — a phone call, a coffee with a friend — can significantly reduce depressive "
            "symptoms. Isolation strengthens depression; connection weakens it."
        ),
        "source": "NIMH (nimh.nih.gov)",
    },
    {
        "id": "samhsa-crisis-1",
        "topic": "crisis",
        "keywords": ["suicidal", "self-harm", "kill", "die", "end it", "hurt myself", "no point"],
        "content": (
            "If you or someone you know is in crisis, contact the 988 Suicide & Crisis Lifeline by "
            "calling or texting 988. The Crisis Text Line is available by texting HOME to 741741. "
            "These services are free, confidential, and available 24/7."
        ),
        "source": "SAMHSA (samhsa.gov)",
    },
    {
        "id": "apa-grounding-1",
        "topic": "grounding",
        "keywords": ["anxious", "panic", "dissociation", "overwhelmed", "detached", "unreal"],
        "content": (
            "The 5-4-3-2-1 grounding technique redirects attention from anxious thoughts to sensory "
            "experience. Name 5 things you see, 4 you can touch, 3 you hear, 2 you smell, 1 you taste. "
            "This interrupts the amygdala's fear response and re-engages the prefrontal cortex."
        ),
        "source": "APA (apa.org)",
    },
    {
        "id": "harvard-gratitude-1",
        "topic": "gratitude",
        "keywords": ["grateful", "thankful", "positive", "happy", "mood", "journal"],
        "content": (
            "Harvard research shows that writing down 3 things you're grateful for each day for 21 days "
            "rewires the brain for optimism. Gratitude journaling increases dopamine and serotonin — "
            "the same neurotransmitters targeted by antidepressants."
        ),
        "source": "Harvard Health Publishing",
    },
    {
        "id": "mayo-exercise-1",
        "topic": "exercise",
        "keywords": ["movement", "exercise", "walk", "yoga", "energy", "tired", "exhausted", "motivation"],
        "content": (
            "Just 20-30 minutes of moderate exercise releases endorphins, reduces cortisol, and "
            "improves sleep quality. Yoga specifically has been shown to reduce anxiety symptoms "
            "by 30% through its combination of movement, breathing, and mindfulness. "
            "Even gentle stretching counts."
        ),
        "source": "Mayo Clinic (mayoclinic.org)",
    },
    {
        "id": "apa-sleep-1",
        "topic": "sleep",
        "keywords": ["sleep", "insomnia", "tired", "exhausted", "restless", "night", "awake"],
        "content": (
            "Sleep hygiene is foundational to mental health. The APA recommends: consistent sleep/wake "
            "times, no screens 60 minutes before bed, cool dark room (65-68°F), and relaxation techniques "
            "like progressive muscle relaxation. Poor sleep increases anxiety risk by 30%."
        ),
        "source": "APA (apa.org)",
    },
    {
        "id": "nimh-stress-1",
        "topic": "stress",
        "keywords": ["stressed", "pressure", "burned out", "overwhelmed", "too much", "can't cope"],
        "content": (
            "Chronic stress shrinks the prefrontal cortex (decision-making) while enlarging the amygdala "
            "(fear center). Brief stress interventions — even 5-minute meditation or breathing exercises — "
            "can reverse these effects. Time management and boundary-setting are evidence-based "
            "stress reducers."
        ),
        "source": "NIMH (nimh.nih.gov)",
    },
    {
        "id": "apa-mindfulness-1",
        "topic": "mindfulness",
        "keywords": ["mindful", "meditation", "present", "calm", "peace", "focus", "racing thoughts"],
        "content": (
            "Mindfulness meditation — even 5 minutes daily — reduces activity in the default mode network "
            "(the brain's 'wandering' circuit linked to rumination). After 8 weeks of practice, the "
            "amygdala physically shrinks, reducing baseline anxiety levels."
        ),
        "source": "APA (apa.org)",
    },
    {
        "id": "cdc-anger-1",
        "topic": "anger",
        "keywords": ["angry", "frustrated", "rage", "irritated", "mad", "annoyed"],
        "content": (
            "Anger is often a secondary emotion masking hurt, fear, or frustration. The 'STOP' technique: "
            "Stop what you're doing, Take a breath, Observe your body sensations, Proceed with intention. "
            "Physical activity — even squeezing ice cubes — can redirect anger energy safely."
        ),
        "source": "CDC Mental Health (cdc.gov/mentalhealth)",
    },
    {
        "id": "mayo-social-1",
        "topic": "loneliness",
        "keywords": ["lonely", "alone", "isolated", "no friends", "disconnected"],
        "content": (
            "Loneliness has the same health impact as smoking 15 cigarettes per day. "
            "Small steps toward connection include: one text to a friend, attending a local event, "
            "volunteering, or joining an online community. Quality matters more than quantity — "
            "one meaningful relationship can buffer against loneliness."
        ),
        "source": "Mayo Clinic (mayoclinic.org)",
    },
    {
        "id": "nimh-therapy-1",
        "topic": "therapy",
        "keywords": ["therapist", "help", "professional", "counselor", "treatment", "therapy"],
        "content": (
            "70-80% of people who engage in psychotherapy experience significant symptom reduction. "
            "CBT is the most researched and shows effectiveness in 12-16 sessions. Finding a therapist "
            "through Psychology Today, BetterHelp, or your insurance provider's directory is a good first step."
        ),
        "source": "NIMH (nimh.nih.gov)",
    },
    {
        "id": "apa-selfcompassion-1",
        "topic": "self-compassion",
        "keywords": ["worthless", "failure", "not good enough", "hate myself", "shame", "guilt"],
        "content": (
            "Self-compassion research by Dr. Kristin Neff shows that treating yourself with the same "
            "kindness you'd show a friend reduces anxiety and depression more effectively than self-esteem "
            "building. The three pillars: self-kindness, common humanity, and mindfulness."
        ),
        "source": "APA (apa.org)",
    },
    {
        "id": "mayo-journaling-1",
        "topic": "journaling",
        "keywords": ["journal", "write", "express", "thoughts", "feelings", "process"],
        "content": (
            "Expressive writing for 15-20 minutes about stressful events has been shown to improve "
            "immune function and reduce healthcare visits by 50%. The key is emotional disclosure — "
            "writing about feelings, not just facts."
        ),
        "source": "Mayo Clinic (mayoclinic.org)",
    },
    {
        "id": "samhsa-substance-1",
        "topic": "substance",
        "keywords": ["drinking", "alcohol", "drugs", "substance", "addiction", "smoking", "vaping"],
        "content": (
            "SAMHSA's National Helpline (1-800-662-4357) provides free, confidential referrals for "
            "substance use and mental health. Self-medication through substances temporarily masks "
            "symptoms but worsens underlying conditions. Evidence-based alternatives include exercise, "
            "social support, and professional therapy."
        ),
        "source": "SAMHSA (samhsa.gov)",
    },
    {
        "id": "harvard-nature-1",
        "topic": "nature",
        "keywords": ["outdoors", "nature", "walk", "fresh air", "outside", "sunshine"],
        "content": (
            "Spending just 20 minutes in nature reduces cortisol by 20%. 'Forest bathing' (shinrin-yoku) "
            "has been shown to lower heart rate, blood pressure, and stress hormones. Even viewing nature "
            "images or listening to nature sounds can activate the parasympathetic nervous system."
        ),
        "source": "Harvard Health Publishing",
    },
    {
        "id": "nimh-routine-1",
        "topic": "routine",
        "keywords": ["confused", "lost", "directionless", "stuck", "purpose", "unmotivated"],
        "content": (
            "Structure and routine provide a sense of control during uncertain times. Start with 3 keystone "
            "habits: consistent wake time, one movement session, and one social interaction per day. "
            "Small wins compound — completing tiny tasks builds momentum and self-efficacy."
        ),
        "source": "NIMH (nimh.nih.gov)",
    },
    {
        "id": "apa-pmr-1",
        "topic": "relaxation",
        "keywords": ["tense", "tight", "body", "muscles", "relax", "physical", "stress"],
        "content": (
            "Progressive Muscle Relaxation (PMR): systematically tense and release each muscle group "
            "for 5-10 seconds. Start with toes, move upward. PMR reduces physiological arousal and "
            "is especially effective for tension headaches, insomnia, and generalized anxiety."
        ),
        "source": "APA (apa.org)",
    },
    {
        "id": "cdc-protective-1",
        "topic": "prevention",
        "keywords": ["wellness", "health", "habits", "protective", "safety", "well-being"],
        "content": (
            "Protective factors that improve mental health include: healthy coping skills, a strong "
            "sense of purpose, physical activity, and social connections. The CDC emphasizes that "
            "physical and mental health are closely linked — chronic conditions like diabetes or "
            "heart disease can increase the risk of mental illness, and vice versa."
        ),
        "source": "CDC Mental Health (cdc.gov/mentalhealth)",
    },
    {
        "id": "mhgov-wellness-1",
        "topic": "wellness",
        "keywords": ["balance", "life", "wellness", "mental health", "general", "basic"],
        "content": (
            "Mental health includes our emotional, psychological, and social well-being. It affects how "
            "we think, feel, and act. It also helps determine how we handle stress, relate to others, "
            "and make choices. Mental health is important at every stage of life, from childhood "
            "and adolescence through adulthood."
        ),
        "source": "MentalHealth.gov",
    },
    {
        "id": "headspace-science-1",
        "topic": "meditation",
        "keywords": ["meditation", "brain", "focus", "amygdala", "stress", "calm"],
        "content": (
            "Published research shows that just 10 days of Headspace can reduce stress by 14%. "
            "Meditation has been shown to decrease activity in the amygdala (the brain's 'fear center') "
            "and increase cortical thickness in the hippocampus, which is responsible for learning "
            "and memory, helping to regulate emotional responses."
        ),
        "source": "Headspace Research",
    },
    {
        "id": "harvard-cbt-1",
        "topic": "cbt",
        "keywords": ["thoughts", "thinking", "distortions", "negative", "shifting", "cbt"],
        "content": (
            "Cognitive Behavioral Therapy (CBT) helps people identify and change destructive or "
            "disturbing thought patterns that have a negative influence on behavior and emotions. "
            "By challenging 'cognitive distortions'—such as all-or-nothing thinking or overgeneralization—"
            "individuals can develop more balanced and realistic perspectives, reducing emotional distress."
        ),
        "source": "Harvard Health Publishing",
    },
    {
        "id": "apa-resilience-1",
        "topic": "resilience",
        "keywords": ["resilience", "tough", "strength", "bounce back", "hardship", "overcome"],
        "content": (
            "Resilience is the process of adapting well in the face of adversity, trauma, tragedy, "
            "threats, or significant sources of stress. It involves 'bouncing back' from difficult "
            "experiences. Resilience is not a trait that people either have or don't have; it "
            "involves behaviors, thoughts, and actions that can be learned and developed in anyone."
        ),
        "source": "APA (apa.org)",
    },
    {
        "id": "who-burnout-1",
        "topic": "burnout",
        "keywords": ["burnout", "exhausted", "work", "stress", "cynicism", "tired", "job"],
        "content": (
            "Burnout is a syndrome conceptualized as resulting from chronic workplace stress that "
            "has not been successfully managed. It is characterized by: feelings of energy depletion "
            "or exhaustion; increased mental distance from one's job, or feelings of negativism "
            "or cynicism related to one's job; and reduced professional efficacy."
        ),
        "source": "WHO (who.int)",
    },
    {
        "id": "samhsa-trauma-1",
        "topic": "trauma",
        "keywords": ["trauma", "pain", "past", "hurting", "scared", "flashback", "nightmare"],
        "content": (
            "Individual trauma results from an event, series of events, or set of circumstances that "
            "is experienced by an individual as physically or emotionally harmful or life-threatening "
            "and that has lasting adverse effects on the individual's functioning and mental, "
            "physical, social, emotional, or spiritual well-being."
        ),
        "source": "SAMHSA (samhsa.gov)",
    },
    {
        "id": "penn-pospsych-1",
        "topic": "positivity",
        "keywords": ["positive", "strengths", "flourish", "well-being", "optimism", "joy"],
        "content": (
            "Positive psychology is the scientific study of the strengths that enable individuals "
            "and communities to thrive. The field is founded on the belief that people want to lead "
            "meaningful and fulfilling lives, to cultivate what is best within themselves, and to "
            "enhance their experiences of love, work, and play."
        ),
        "source": "Penn Positive Psychology Center",
    },
]


def _score_snippet(snippet: dict, query: str) -> int:
    """Score a snippet's relevance to the query using keyword matching."""
    query_lower = query.lower()
    score = 0
    for keyword in snippet["keywords"]:
        if keyword in query_lower:
            score += 2
    # Partial topic match
    if snippet["topic"] in query_lower:
        score += 3
    return score


async def retrieve_context(query: str, top_k: int = 5) -> str:
    """
    Retrieve relevant knowledge chunks from the curated knowledge base.

    Uses keyword matching for relevance scoring.
    Returns concatenated context string with source attribution.

    Args:
        query: User's emotional text input
        top_k: Number of chunks to retrieve

    Returns:
        Concatenated relevant context string
    """
    if not query or not query.strip():
        return ""

    # Score all snippets
    scored = [(snippet, _score_snippet(snippet, query)) for snippet in KNOWLEDGE_BASE]

    # Filter to only relevant snippets (score > 0) and sort by score
    relevant = sorted(
        [(s, score) for s, score in scored if score > 0],
        key=lambda x: x[1],
        reverse=True,
    )[:top_k]

    if not relevant:
        return ""

    # Format as context string
    chunks = []
    for snippet, score in relevant:
        chunks.append(f"[{snippet['source']}]\n{snippet['content']}")

    return "\n\n".join(chunks)
