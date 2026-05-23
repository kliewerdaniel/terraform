from terraform.models.llm_client import LLMClient

INTERVIEW_QUESTIONS = [
    # Lifestyle probes
    "How do you imagine spending time in your outdoor space? Morning coffee? Weekend gatherings? Evening quiet?",
    "Who will use this space most — just you, your family, frequent guests?",
    # Emotional goals
    "What feeling do you want your landscape to evoke when you step outside? Serenity? Inspiration? Vitality? Shelter?",
    "Are you seeking a space that feels expansive and open, or intimate and tucked away?",
    # Environmental
    "Describe your property if you can: size, sun exposure, existing trees, slope, soil type. Even a rough sense helps.",
    "Are there any specific views you want to frame or screen? Neighbors, roads, a sunset horizon?",
    # Entertaining
    "How important is outdoor entertaining to you? Intimate dinners, large parties, fire pit gatherings, poolside lounging?",
    "Do you want dedicated spaces for cooking, dining, lounging, or all of the above?",
    # Maintenance
    "What's your relationship with maintenance — do you enjoy gardening as a practice, or do you prefer a set-and-forget landscape?",
    # Ecological priorities
    "How important are native plants and wildlife habitat to you? Are pollinators, birds, or butterflies something you want to attract?",
    "Are you interested in rainwater harvesting, xeriscaping, or other water conservation strategies?",
    # Practical
    "Do you have a budget range in mind? This helps us calibrate ambitions to reality.",
    "Are there any existing elements you want to keep — trees, structures, stonework, gardens?",
    # Atmosphere
    "Describe a perfect moment in your future landscape — time of day, season, sounds, scents, light. Paint the picture.",
]


class Interviewer:
    def __init__(self, llm: LLMClient | None = None):
        self.llm = llm or LLMClient()
        self.questions = INTERVIEW_QUESTIONS
        self.question_index = 0
        self.answers: dict = {}
        self.profile: dict = {}

    def pick_question(self, context: str) -> str:
        answered_topics = set()
        for key in self.answers:
            answered_topics.add(key.lower())

        for q in self.questions:
            topic_words = [w for w in q.lower().split() if len(w) > 4]
            if not any(tw in " ".join(answered_topics) for tw in topic_words):
                return q
        return self.questions[-1]

    def record_answer(self, question: str, answer: str):
        key = question.split("?")[0][:60]
        self.answers[key] = answer

    def is_complete(self) -> bool:
        return len(self.answers) >= 5

    def get_summary(self) -> str:
        parts = [f"{q}: {a}" for q, a in self.answers.items()]
        return "\n".join(parts)

    async def interpret(self) -> str:
        summary = self.get_summary()
        prompt = f"""Based on these interview responses, create a concise lifestyle and land profile:

{summary}

Extract: lifestyle patterns, emotional goals, site characteristics, entertaining style, maintenance preference, ecological priorities, and budget context."""
        return await self.llm.generate(
            system_prompt="You are a landscape design interviewer building a user profile for TERRAFORM.",
            user_prompt=prompt,
            temperature=0.6,
        )
