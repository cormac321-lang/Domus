import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true, // Only for development
});

export const generateEmail = async (template, data) => {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are a professional property management assistant. Generate clear, concise, and professional emails."
        },
        {
          role: "user",
          content: `Generate an email using this template: ${template} with these details: ${JSON.stringify(data)}`
        }
      ],
      temperature: 0.7,
    });

    return completion.choices[0].message.content;
  } catch (error) {
    console.error('Error generating email:', error);
    throw error;
  }
};

export const generateMaintenanceResponse = async (request) => {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are a professional property maintenance coordinator. Generate clear, helpful responses to maintenance requests."
        },
        {
          role: "user",
          content: `Generate a response to this maintenance request: ${JSON.stringify(request)}`
        }
      ],
      temperature: 0.7,
    });

    return completion.choices[0].message.content;
  } catch (error) {
    console.error('Error generating maintenance response:', error);
    throw error;
  }
};

export const generateLeaseClause = async (clauseType, details) => {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are a legal assistant specializing in property law. Generate clear, legally sound lease clauses."
        },
        {
          role: "user",
          content: `Generate a ${clauseType} clause with these details: ${JSON.stringify(details)}`
        }
      ],
      temperature: 0.7,
    });

    return completion.choices[0].message.content;
  } catch (error) {
    console.error('Error generating lease clause:', error);
    throw error;
  }
}; 