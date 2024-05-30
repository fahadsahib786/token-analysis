document.getElementById('tokenForm').addEventListener('submit', async (event) => {
  event.preventDefault();

  const formData = new FormData(event.target);
  const data = Object.fromEntries(formData.entries());

  try {
    const response = await fetch('/analyze', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });

    const result = await response.json();
    alert('Analysis: ' + result.analysis);

    if (data.email) {
      await fetch('/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email: data.email, analysis: result.analysis })
      });
    }
  } catch (error) {
    console.error('Error:', error);
    alert('An error occurred while analyzing the token.');
  }
});
