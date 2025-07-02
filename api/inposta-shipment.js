export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const response = await fetch('https://app.inpostaradeski.mk/api/v1/shipments', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'SFMyNTY.g2gDYgAADTJuBgDed1PblgFiAAFRgA.xpXhTNFhpzhFGVH3yPxeB-t_EsQhZGbCCB8XOer99t4',
      },
      body: JSON.stringify(req.body),
    });

    const data = await response.json();
    res.status(response.status).json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to contact InPosta API' });
  }
} 