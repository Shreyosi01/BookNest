from fastapi import APIRouter
from app import schemas

router = APIRouter(prefix="/ai", tags=["ai"])

RECOMMENDATIONS_DATABASE = {
    "fiction": [
        schemas.RecommendationItem(
            title="Tomorrow, and Tomorrow, and Tomorrow",
            author="Gabrielle Zevin",
            reason="A beautifully written novel exploring creativity, game design, and lifelong friendship.",
        ),
        schemas.RecommendationItem(
            title="Klara and the Sun",
            author="Kazuo Ishiguro",
            reason="A gentle, luminous reflection on love, artificial beings, and what makes humanity special.",
        ),
        schemas.RecommendationItem(
            title="The Midnight Library",
            author="Matt Haig",
            reason="A touching story of second chances and parallel lives.",
        ),
    ],
    "fantasy": [
        schemas.RecommendationItem(
            title="The Name of the Wind",
            author="Patrick Rothfuss",
            reason="An immersive tale of music, magic, and legends.",
        ),
        schemas.RecommendationItem(
            title="Piranesi",
            author="Susanna Clarke",
            reason="A lyrical, mysterious journey through an infinite, ocean-filled labyrinth.",
        ),
        schemas.RecommendationItem(
            title="The Priory of the Orange Tree",
            author="Samantha Shannon",
            reason="A rich, grand epic with deep lore and compelling heroines.",
        ),
    ],
    "science fiction": [
        schemas.RecommendationItem(
            title="Project Hail Mary",
            author="Andy Weir",
            reason="A high-stakes, science-driven space survival story filled with optimism and humor.",
        ),
        schemas.RecommendationItem(
            title="Dark Matter",
            author="Blake Crouch",
            reason="A fast-paced, psychological sci-fi thriller about choices and alternate timelines.",
        ),
        schemas.RecommendationItem(
            title="Children of Time",
            author="Adrian Tchaikovsky",
            reason="A masterful space opera chronicling the survival of human and non-human civilizations.",
        ),
    ],
    "mystery": [
        schemas.RecommendationItem(
            title="The Thursday Murder Club",
            author="Richard Osman",
            reason="A witty, heartwarming mystery featuring clever pensioners solving cold cases.",
        ),
        schemas.RecommendationItem(
            title="The Silent Patient",
            author="Alex Michaelides",
            reason="A gripping psychological thriller with a jaw-dropping final reveal.",
        ),
    ],
    "thriller": [
        schemas.RecommendationItem(
            title="Verity",
            author="Colleen Hoover",
            reason="A dark, twist-heavy suspense thriller.",
        ),
        schemas.RecommendationItem(
            title="Gone Girl",
            author="Gillian Flynn",
            reason="The defining modern psychological thriller about deceit and obsession.",
        ),
    ],
    "romance": [
        schemas.RecommendationItem(
            title="Book Lovers",
            author="Emily Henry",
            reason="A witty, delightful romantic comedy celebrating book lovers and city vs. country tropes.",
        ),
        schemas.RecommendationItem(
            title="The Seven Husbands of Evelyn Hugo",
            author="Taylor Jenkins Reid",
            reason="A lavish, emotional story of Old Hollywood romance and hidden truths.",
        ),
    ],
}


@router.post("/recommendations", response_model=schemas.RecommendationResponse)
def get_recommendations(payload: schemas.RecommendationRequest):
    genre_key = (payload.genre or "").lower().strip()
    query_text = (payload.query or "").lower().strip()
    mood_text = (payload.mood or "").lower().strip()

    matches = []
    for category, items in RECOMMENDATIONS_DATABASE.items():
        if category in genre_key or (genre_key and genre_key in category):
            matches.extend(items)
            break

    if not matches and (query_text or mood_text):
        for category, items in RECOMMENDATIONS_DATABASE.items():
            if category in query_text or category in mood_text:
                matches.extend(items)

    if not matches:
        matches = [
            schemas.RecommendationItem(
                title="Tomorrow, and Tomorrow, and Tomorrow",
                author="Gabrielle Zevin",
                reason="An inspiring, character-driven journey of love and creativity.",
            ),
            schemas.RecommendationItem(
                title="Project Hail Mary",
                author="Andy Weir",
                reason="A smart, uplifting adventure of survival and friendship.",
            ),
            schemas.RecommendationItem(
                title="Piranesi",
                author="Susanna Clarke",
                reason="An evocative, magical puzzle box of an ancient hall.",
            ),
        ]

    return schemas.RecommendationResponse(recommendations=matches[:6])
