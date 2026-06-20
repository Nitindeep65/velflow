import json
from openai import OpenAI
from app.config import settings

# Initialize client if API key is provided
client = None
if settings.NVIDIA_API_KEY:
    client = OpenAI(
        base_url="https://integrate.api.nvidia.com/v1",
        api_key=settings.NVIDIA_API_KEY
    )

def extract_contract_metadata(text: str) -> dict:
    """
    Passes contract text to the NVIDIA NIM LLM to extract structured metadata, summary, risks, and dates.
    """
    if not client:
        print("Warning: NVIDIA_API_KEY not set. Skipping AI extraction.")
        return {}

    # Limit text to roughly 30k characters to fit safely in context window
    max_chars = 30000
    truncated_text = text[:max_chars]

    prompt = (
        "You are an expert legal AI assistant. Your task is to extract the following information "
        "from the contract text provided below.\n\n"
        "Please extract:\n"
        "1. 'counterparty': The name of the other party in the agreement.\n"
        "2. 'type': The type of agreement (e.g., NDA, MSA, SaaS, Lease, Employment, Vendor).\n"
        "3. 'risk': The overall risk level (strictly 'Low', 'Medium', or 'High'). Default to 'Medium' if unsure.\n"
        "4. 'next_date': The expiration date, renewal date, or next important milestone date in YYYY-MM-DD format.\n"
        "5. 'summary_points': A list of 3-5 concise, high-level summary bullet points of the contract's key terms.\n"
        "6. 'risks': A list of key risks or unfavorable clauses, each with:\n"
        "   - 'text': Description of the risk/clause.\n"
        "   - 'severity': Risk level (strictly 'High', 'Medium', or 'Low').\n"
        "7. 'dates_timeline': A list of important upcoming dates, milestones, or deadlines mentioned in the contract (e.g. effective date, notice deadline, term end, renewals). Each date object should have:\n"
        "   - 'id': A unique short slug (e.g., 'term_end', 'notice_deadline').\n"
        "   - 'title': The name of the milestone (e.g. 'Initial Term End', 'Renewal Notice Deadline').\n"
        "   - 'date': The date in YYYY-MM-DD format.\n"
        "   - 'badge': Classification badge (strictly 'Critical - Renewal', 'Important', or 'Upcoming').\n"
        "   - 'active': Boolean set to true.\n"
        "   - 'description': A short, clear explanation of what this date means.\n\n"
        "Return ONLY a valid JSON object with these exact keys: 'counterparty', 'type', 'risk', 'next_date', 'summary_points', 'risks', 'dates_timeline'. "
        "Do not include any wrapper text, markdown blocks, introductory remarks, or trailing explanations. Return pure JSON.\n\n"
        f"Contract Text:\n{truncated_text}"
    )

    try:
        response = client.chat.completions.create(
            model="mistralai/mistral-medium-3.5-128b",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.3,
            top_p=1.0,
            max_tokens=4096,
        )

        content = response.choices[0].message.content.strip()
        # Clean markdown code blocks if the model wrapped it
        if content.startswith("```json"):
            content = content[7:]
        if content.startswith("```"):
            content = content[3:]
        if content.endswith("```"):
            content = content[:-3]
            
        data = json.loads(content.strip())
        return data

    except Exception as e:
        print(f"Error calling NVIDIA AI API: {e}")
        return {}

def ask_contract_question(text: str, question: str) -> str:
    """
    Asks the AI a specific question based on the contract text.
    """
    if not client:
        return "Warning: NVIDIA_API_KEY not set. Cannot use AI assistant."

    max_chars = 30000
    truncated_text = text[:max_chars]

    prompt = (
        "You are an expert legal AI assistant. Your role is to analyze the provided contract text and provide highly detailed, accurate, and professional answers to the user's questions.\n"
        "Guidelines:\n"
        "1. Base your answer strictly on the provided contract text. Do not hallucinate or make up external information.\n"
        "2. Provide comprehensive, thorough, and analytical explanations.\n"
        "3. Use Markdown formatting (bullet points, bold text, short paragraphs) to make your answer easy to read, structured, and visually appealing.\n"
        "4. Whenever possible, explicitly quote or reference specific clauses from the text to support your answer.\n"
        "5. If the answer is not contained within the contract, clearly state: 'I cannot find the answer to this in the document.'\n\n"
        f"Contract Text:\n{truncated_text}\n\n"
        f"User Question: {question}"
    )

    try:
        response = client.chat.completions.create(
            model="mistralai/mistral-medium-3.5-128b",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.3,
            top_p=0.9,
            max_tokens=3000,
        )
        return response.choices[0].message.content.strip()
    except Exception as e:
        print(f"Error calling NVIDIA AI API: {e}")
        return "An error occurred while analyzing the document."

def compare_contracts_ai(base_text: str, compare_text: str, base_name: str, compare_name: str) -> dict:
    """
    Compares two contracts and returns structured details about changes in 5 categories:
    Term & Renewal, Termination, Liability & Indemnity, Payment & Fees, Governing Law.
    """
    if not client:
        return {"error": "NVIDIA API Key not set. Cannot use AI comparison."}

    # Truncate to fit within safety limits
    base_truncated = base_text[:15000]
    compare_truncated = compare_text[:15000]

    prompt = (
        "You are an expert legal AI assistant. Your task is to compare two versions of a contract: a Base Contract and a New Contract.\n\n"
        f"Base Contract Name: {base_name}\n"
        f"New Contract Name: {compare_name}\n\n"
        "Identify and analyze the key changes between the two documents. Specifically, evaluate the changes across these 5 categories:\n"
        "1. Term & Renewal\n"
        "2. Termination\n"
        "3. Liability & Indemnity\n"
        "4. Payment & Fees\n"
        "5. Governing Law\n\n"
        "For EACH category, you must return:\n"
        "- 'status': strictly 'Unchanged' or 'Modified'\n"
        "- 'old_text': The relevant snippet or clause from the Base Contract. If unchanged or not present, return null or a general summary.\n"
        "- 'new_text': The relevant snippet or clause from the New Contract. If unchanged or not present, return null or a general summary.\n"
        "- 'change_summary': A brief, plain-English explanation (1-2 sentences) of what changed and its impact.\n\n"
        "Also, detect and list 1 to 4 overall 'key_changes' badges. Each badge object should contain:\n"
        "- 'text': The name of the change (e.g., 'New auto-renew clause added', 'Liability cap increased').\n"
        "- 'impact': strictly 'High', 'Medium', or 'Low'.\n\n"
        "Return ONLY a valid JSON object matching this structure:\n"
        "{\n"
        "  \"key_changes\": [\n"
        "    { \"text\": \"Change description\", \"impact\": \"High\" }\n"
        "  ],\n"
        "  \"categories\": {\n"
        "    \"Term & Renewal\": {\n"
        "      \"status\": \"Modified\",\n"
        "      \"old_text\": \"old text here...\",\n"
        "      \"new_text\": \"new text here...\",\n"
        "      \"change_summary\": \"AI summary of changes...\"\n"
        "    },\n"
        "    \"Termination\": { ... },\n"
        "    \"Liability & Indemnity\": { ... },\n"
        "    \"Payment & Fees\": { ... },\n"
        "    \"Governing Law\": { ... }\n"
        "  }\n"
        "}\n\n"
        "Do not include markdown code block formats or anything else. Just valid raw JSON.\n\n"
        f"--- BASE CONTRACT TEXT ---\n{base_truncated}\n\n"
        f"--- NEW CONTRACT TEXT ---\n{compare_truncated}"
    )

    try:
        response = client.chat.completions.create(
            model="mistralai/mistral-medium-3.5-128b",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.3,
            max_tokens=4096,
        )
        content = response.choices[0].message.content.strip()
        if content.startswith("```json"):
            content = content[7:]
        if content.startswith("```"):
            content = content[3:]
        if content.endswith("```"):
            content = content[:-3]
            
        return json.loads(content.strip())
    except Exception as e:
        print(f"Error in contract comparison AI: {e}")
        return {"error": str(e)}
