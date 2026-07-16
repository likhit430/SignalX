const { GoogleGenerativeAI } = require('@google/generative-ai');

/**
 * Fallback local classification logic when Gemini API is unavailable or fails
 */
function localFallbackClassify(message) {
  const msg = message.toLowerCase();
  let category = 'Other';
  let priority = 'Medium';
  let summary = 'Local triage completed.';
  let suggestedAction = 'Standby for dispatcher instructions.';
  let requiredResources = ['Field Responder'];
  let broadcastRadius = 5;

  if (msg.includes('fire') || msg.includes('smoke') || msg.includes('burn') || msg.includes('explosion')) {
    category = 'Fire';
    priority = 'Critical';
    summary = 'Fire or explosion event reported.';
    suggestedAction = 'Evacuate area immediately and move to safety.';
    requiredResources = ['Fire Extinguisher', 'Evacuation Team'];
    broadcastRadius = 8;
  } else if (msg.includes('bleed') || msg.includes('breath') || msg.includes('heart') || msg.includes('injury') || msg.includes('accident') || msg.includes('unconscious')) {
    category = 'Medical';
    priority = 'Critical';
    summary = 'Medical trauma or urgent health event.';
    suggestedAction = 'Administer basic first aid if trained. Keep victim stable.';
    requiredResources = ['Medical Kit', 'First Responder'];
    broadcastRadius = 5;
  } else if (msg.includes('food') || msg.includes('hunger') || msg.includes('starv') || msg.includes('rations')) {
    category = 'Food';
    priority = 'Medium';
    summary = 'Food shortage or starvation warning.';
    suggestedAction = 'Report to nearest supply distribution post.';
    requiredResources = ['Food Packs', 'Logistics Node'];
    broadcastRadius = 3;
  } else if (msg.includes('water') || msg.includes('dehydrat') || msg.includes('thirst')) {
    category = 'Water';
    priority = 'High';
    summary = 'Potable water shortage or dehydration risk.';
    suggestedAction = 'Request water delivery blocks at current coordinates.';
    requiredResources = ['Water Blocks', 'Logistics Node'];
    broadcastRadius = 4;
  } else if (msg.includes('shelter') || msg.includes('freeze') || msg.includes('cold') || msg.includes('homeless')) {
    category = 'Shelter';
    priority = 'Medium';
    summary = 'Lack of shelter or severe cold exposure risk.';
    suggestedAction = 'Move to nearest marked evac station or community hub.';
    requiredResources = ['Thermal Blankets', 'Shelter Coordinator'];
    broadcastRadius = 3;
  } else if (msg.includes('missing') || msg.includes('lost') || msg.includes('kidnap') || msg.includes('disappear')) {
    category = 'Missing Person';
    priority = 'High';
    summary = 'Missing civilian report.';
    suggestedAction = 'Log details, last known coordinates, and physical description.';
    requiredResources = ['Search Unit', 'Grid Operator'];
    broadcastRadius = 10;
  } else if (msg.includes('weapon') || msg.includes('rob') || msg.includes('attack') || msg.includes('assault') || msg.includes('fight') || msg.includes('threat')) {
    category = 'Security';
    priority = 'Critical';
    summary = 'Security threat or active physical conflict.';
    suggestedAction = 'Seek immediate cover and avoid direct confrontation.';
    requiredResources = ['Security Unit', 'Evacuation Team'];
    broadcastRadius = 6;
  }

  // Warning check
  const warning = 'WARNING: Direct physical danger. Contact available local emergency responders immediately.';

  return {
    isEmergency: true,
    category,
    priority,
    summary: `${summary} (FALLBACK MODE)`,
    suggestedAction: `${suggestedAction} (${warning})`,
    requiredResources,
    broadcastRadius
  };
}

/**
 * Clean markdown code fences and whitespace from response text
 */
function cleanJsonResponseText(text) {
  let cleaned = text.trim();
  if (cleaned.startsWith('```')) {
    // Strip starting block (e.g. ```json or ```)
    cleaned = cleaned.replace(/^```[a-zA-Z]*\n?/, '');
    // Strip ending block
    cleaned = cleaned.replace(/\n?```$/, '');
  }
  return cleaned.trim();
}

/**
 * Validate that the parsed JSON matches required schemas
 */
function validateAIResponse(data) {
  const validCategories = ['Medical', 'Fire', 'Food', 'Water', 'Shelter', 'Missing Person', 'Security', 'Other'];
  const validPriorities = ['Low', 'Medium', 'High', 'Critical'];

  if (typeof data.isEmergency !== 'boolean') return false;
  if (!validCategories.includes(data.category)) return false;
  if (!validPriorities.includes(data.priority)) return false;
  if (typeof data.summary !== 'string' || !data.summary) return false;
  if (typeof data.suggestedAction !== 'string' || !data.suggestedAction) return false;
  if (!Array.isArray(data.requiredResources)) return false;
  if (typeof data.broadcastRadius !== 'number') return false;

  return true;
}

/**
 * Reusable backend Gemini service to classify emergency descriptions
 */
const classifyEmergencyText = async (message) => {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    console.warn('GEMINI_API_KEY not found in environment. Running local fallback classification.');
    return localFallbackClassify(message);
  }

  try {
    // Initialize the SDK with the API key from environment
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const systemPrompt = `
You are an expert AI emergency triage operator for the SIGNALX crisis network.
Analyze the user's emergency description and classify it into strict JSON format.

Allowed Categories: "Medical", "Fire", "Food", "Water", "Shelter", "Missing Person", "Security", "Other"
Allowed Priorities: "Low", "Medium", "High", "Critical"

Rules:
1. Return ONLY a valid JSON object matching the schema below. No conversational text, no markdown fences outside the JSON.
2. The field "isEmergency" must be boolean.
3. The field "category" must match one of the allowed categories.
4. The field "priority" must match one of the allowed priorities.
5. The field "summary" must be a concise 1-sentence summary of the emergency.
6. The field "suggestedAction" must contain clear immediate instructions for safety. Add the warning: "WARNING: Direct physical danger. Contact available local emergency responders immediately."
7. NEVER claim that police, hospitals, or formal emergency services were actually contacted by you or this system.
8. The field "requiredResources" must be a string array of resource tags (e.g. ["First Aid", "Water Pack"]).
9. The field "broadcastRadius" must be a number from 1 to 10 (representing grid radius in km).

JSON Schema to return:
{
  "isEmergency": true,
  "category": "Medical",
  "priority": "Critical",
  "summary": "Short emergency summary",
  "suggestedAction": "Immediate recommended action. WARNING: Direct physical danger. Contact available local emergency responders immediately.",
  "requiredResources": ["Doctor", "Ambulance"],
  "broadcastRadius": 5
}
`;

    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: `System prompt:\n${systemPrompt}\n\nEmergency Description to classify:\n"${message}"` }] }]
    });

    const responseText = result.response.text();
    const cleanedText = cleanJsonResponseText(responseText);
    const parsedData = JSON.parse(cleanedText);

    if (validateAIResponse(parsedData)) {
      // Ensure the warning is attached if not present
      const warningText = 'WARNING: Direct physical danger. Contact available local emergency responders immediately.';
      if (!parsedData.suggestedAction.includes(warningText)) {
        parsedData.suggestedAction = `${parsedData.suggestedAction} (${warningText})`;
      }
      return parsedData;
    } else {
      console.warn('AI response validation failed. Falling back to local classification.');
      return localFallbackClassify(message);
    }
  } catch (error) {
    console.error('Gemini Classification Error:', error.message);
    return localFallbackClassify(message);
  }
};

module.exports = { classifyEmergencyText };
