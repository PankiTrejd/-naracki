export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const response = await fetch('https://app.inpostaradeski.mk/api/v1/shipments', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Add any required auth headers here, e.g. 'Authorization': 'Bearer ...'
      },
      body: JSON.stringify(req.body),
    });

    const data = await response.json();
    res.status(response.status).json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to contact InPosta API' });
  }
} 