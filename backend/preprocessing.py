# Same cleaning function as in training/original_pipeline.py
import re


def clean_bilingual_text(text: str) -> str:
    """Cleans text preserving Kazakh specific characters (ә, ғ, қ, ң, ө, ұ, ү, h, і) and Russian Cyrillic."""
    text = str(text)
    # Remove URLs and hyperlinks
    text = re.sub(r'https?://\S+|www\.\S+', ' ', text)
    # Remove HTML tags
    text = re.sub(r'<.*?>', ' ', text)
    # Remove mentions, tags, emails
    text = re.sub(r'[\w\.-]+@[\w\.-]+', ' ', text)
    # Keep Cyrillic characters (Russian + Kazakh extensions) and remove digits/special characters
    text = re.sub(r'[^а-яА-ЯёЁәіңғүұқөһӘІҢҒҮҰҚӨҺ\s]', ' ', text)
    # Lowercase & collapse whitespaces
    text = text.lower().strip()
    text = re.sub(r'\s+', ' ', text)
    return text


MIN_CLEAN_LENGTH = 10
