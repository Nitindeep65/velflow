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

def generate_contract_draft(template_type: str, variables: dict) -> str:
    """
    Generates a contract draft based on the template type and user-provided variables.
    Supports Nvidia NIM mistral completion or native offline fallbacks.
    """
    if not client:
        # Fallback template generator if API key is not present
        disclosing_party = variables.get("disclosing_party", "Disclosing Party")
        receiving_party = variables.get("receiving_party", "Receiving Party")
        effective_date = variables.get("effective_date", "2026-07-01")
        governing_law = variables.get("governing_law", "Delaware")
        purpose = variables.get("purpose", "evaluating a potential business partnership")
        term = variables.get("term", "3 years")
        value = variables.get("value", "0.0")

        if template_type == "NDA":
            return (
                f"# MUTUAL NON-DISCLOSURE AGREEMENT\n\n"
                f"This Mutual Non-Disclosure Agreement (\"Agreement\") is entered into on this {effective_date} "
                f"(\"Effective Date\") by and between **{disclosing_party}** and **{receiving_party}** (collectively, \"Parties\").\n\n"
                f"### 1. Purpose\n"
                f"The Parties wish to explore a business opportunity of mutual interest regarding **{purpose}**. "
                f"In connection with this, the Parties may share proprietary or confidential information.\n\n"
                f"### 2. Definition of Confidential Information\n"
                f"\"Confidential Information\" refers to any proprietary information, trade secrets, software, "
                f"designs, or business plans marked confidential or disclosed under circumstances where it should "
                f"reasonably be understood as confidential.\n\n"
                f"### 3. Non-Disclosure Obligations\n"
                f"The Receiving Party agrees to maintain the strict confidentiality of all disclosed information and "
                f"not to use it for any purpose outside the scope of {purpose} without written permission.\n\n"
                f"### 4. Term and Obligations\n"
                f"This Agreement and the obligations of confidentiality shall remain in effect for a term of **{term}** "
                f"from the Effective Date, unless terminated earlier by written notice.\n\n"
                f"### 5. Governing Law\n"
                f"This Agreement shall be governed by, and construed in accordance with, the laws of the State of **{governing_law}**.\n\n"
                f"**IN WITNESS WHEREOF**, the Parties have executed this Agreement as of the Effective Date.\n\n"
                f"**Disclosing Party:** {disclosing_party}  \n"
                f"**Receiving Party:** {receiving_party}  \n"
            )
        elif template_type == "SaaS":
            pricing = variables.get("pricing", "$10,000 annually")
            sla = variables.get("sla", "99.9% uptime")
            return (
                f"# SOFTWARE AS A SERVICE (SAAS) AGREEMENT\n\n"
                f"This SaaS Agreement is made as of {effective_date} by and between **{disclosing_party}** "
                f"(\"Provider\") and **{receiving_party}** (\"Customer\").\n\n"
                f"### 1. License Grant & Access\n"
                f"Provider grants Customer a non-exclusive, non-transferable right to access and use the SaaS services "
                f"for its internal business operations during the term of this agreement.\n\n"
                f"### 2. Fees and Payments\n"
                f"Customer shall pay Provider the SaaS subscription fees of **{pricing}**. Late payments shall accrue interest "
                f"at 1.5% per month.\n\n"
                f"### 3. Service Level Agreement (SLA)\n"
                f"Provider commits to maintaining a monthly uptime service level of **{sla}**. If Provider fails to meet "
                f"this level, Customer shall be entitled to service credits as detailed in Schedule A.\n\n"
                f"### 4. Intellectual Property\n"
                f"Provider retains all right, title, and interest in and to the SaaS platforms, designs, and logos. Customer "
                f"retains all intellectual property rights to the data uploaded to the SaaS service.\n\n"
                f"### 5. Governing Law\n"
                f"This Agreement is governed by the laws of the State of **{governing_law}**.\n\n"
                f"**IN WITNESS WHEREOF**, the Parties have executed this SaaS Agreement.\n"
            )
        else: # Contractor
            scope = variables.get("scope", "providing software development and consulting services")
            return (
                f"# INDEPENDENT CONTRACTOR AGREEMENT\n\n"
                f"This Agreement is made as of {effective_date} between **{disclosing_party}** (\"Client\") "
                f"and **{receiving_party}** (\"Contractor\").\n\n"
                f"### 1. Services to be Performed\n"
                f"Contractor agrees to perform the services described in Exhibit A: **{scope}**.\n\n"
                f"### 2. Compensation & Payments\n"
                f"Client shall compensate Contractor in the amount of **{value}** upon successful completion of deliverables.\n\n"
                f"### 3. Independent Contractor Status\n"
                f"Contractor is an independent contractor. Contractor is not an employee, agent, or partner of the Client.\n\n"
                f"### 4. Intellectual Property Ownership\n"
                f"All work product, code, designs, or documentation produced by Contractor in connection with these services "
                f"shall belong exclusively to the Client as work-for-hire upon full payment of fees.\n\n"
                f"### 5. Governing Law\n"
                f"This Agreement is governed by the laws of the State of **{governing_law}**.\n\n"
                f"**IN WITNESS WHEREOF**, the Parties have signed this Agreement.\n"
            )

    prompt = (
        f"You are an expert corporate lawyer. Your task is to draft a highly professional, comprehensive "
        f"and legally sound contract of type '{template_type}' based on the following user-provided parameters:\n\n"
        f"{json.dumps(variables, indent=2)}\n\n"
        f"Ensure the draft includes standard boilerplates (Governing Law, Severability, Entire Agreement, Term/Termination, "
        f"Intellectual Property, Liability/Indemnity limitations) and reads like a real, enforceable legal contract. "
        f"Use Markdown headings, bold text, and lists to make it readable and beautifully formatted. Do not write any "
        f"commentary, introductions, or legal disclaimers. Start drafting directly with the contract title."
    )

    try:
        response = client.chat.completions.create(
            model="mistralai/mistral-medium-3.5-128b",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.7,
            max_tokens=4000,
        )
        return response.choices[0].message.content.strip()
    except Exception as e:
        print(f"Error generating contract draft: {e}")
        return "Failed to generate legal draft using AI."


def check_contract_against_playbook(contract_text: str, playbook_rules: list[dict]) -> list[dict]:
    """
    Checks a contract's extracted text against a list of company playbook rules.
    Returns a list of violation dicts: [{rule_category, violation, clause_text, severity}]
    Falls back to keyword matching if AI is unavailable.
    """
    if not client:
        # Offline fallback: keyword matching
        violations = []
        for rule in playbook_rules:
            category = rule.get("rule_category", "")
            forbidden = rule.get("forbidden_terms", "") or ""
            preferred = rule.get("preferred_terms", "") or ""
            severity = rule.get("risk_level", "High")
            
            # Check forbidden terms
            if forbidden:
                for term in [t.strip() for t in forbidden.split(",") if t.strip()]:
                    if term.lower() in contract_text.lower():
                        violations.append({
                            "rule_category": category,
                            "violation": f"Forbidden term found: '{term}'",
                            "clause_text": f"...{term}...",
                            "severity": severity,
                        })
            # Check preferred terms are absent
            if preferred:
                for term in [t.strip() for t in preferred.split(",") if t.strip()]:
                    if term.lower() not in contract_text.lower():
                        violations.append({
                            "rule_category": category,
                            "violation": f"Required term missing: '{term}'",
                            "clause_text": "(not found in document)",
                            "severity": severity,
                        })
        return violations

    rules_text = json.dumps(playbook_rules, indent=2)
    prompt = (
        "You are an expert corporate legal compliance officer. Your task is to review a contract "
        "against a company's internal legal playbook rules and identify any violations.\n\n"
        "Company Playbook Rules:\n"
        f"{rules_text}\n\n"
        "For each rule, check the contract text below and identify violations. "
        "Return ONLY a valid JSON array. Each element must have exactly:\n"
        "- 'rule_category': the category name from the rule\n"
        "- 'violation': a short description of what violates the rule\n"
        "- 'clause_text': the specific offending clause text (max 200 chars)\n"
        "- 'severity': strictly 'High', 'Medium', or 'Low'\n\n"
        "If no violations exist for a rule, omit it. Return [] if fully compliant.\n\n"
        f"Contract Text:\n{contract_text[:25000]}"
    )

    try:
        response = client.chat.completions.create(
            model="mistralai/mistral-medium-3.5-128b",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.2,
            max_tokens=2048,
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
        print(f"Error in playbook compliance check: {e}")
        return []


def suggest_playbook_alternative(
    rule_category: str,
    violation: str,
    clause_text: str,
    preferred_terms: str = None,
    forbidden_terms: str = None
) -> str:
    """
    Generates a compliant alternative clause based on a playbook violation and standard preferred terms.
    """
    if not client:
        # Offline fallback
        pref = preferred_terms or "standard compliant parameters"
        return f"This agreement is subject to the rule category of '{rule_category}', in accordance with terms: {pref}."

    prompt = (
        "You are an expert corporate legal draftsman. You are given a clause that violates our company policy, "
        "along with the playbook policy specifications. Rephrase the clause so that it complies with our policy.\n\n"
        f"Rule Category: {rule_category}\n"
        f"Violation Description: {violation}\n"
        f"Original Clause:\n{clause_text}\n\n"
        f"Preferred/Required Terms to Include: {preferred_terms or 'None specified'}\n"
        f"Forbidden Terms to Exclude: {forbidden_terms or 'None specified'}\n\n"
        "Generate ONLY the suggested compliant clause text. Do not provide introductions, conversational remarks, "
        "explanations, or markdown backticks. Just output the clause directly."
    )

    try:
        response = client.chat.completions.create(
            model="mistralai/mistral-medium-3.5-128b",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.3,
            max_tokens=1024,
        )
        return response.choices[0].message.content.strip()
    except Exception as e:
        print(f"Error generating compliance alternative: {e}")
        return f"Unable to generate suggestion. Please ensure terms match: {preferred_terms or 'standard terms'}"

