document.getElementById('tokenAnalysisForm').addEventListener('submit', async (event) => {
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
  
      if (!response.ok) {
        throw new Error('Failed to analyze the token');
      }
  
      const result = await response.json();
      const analysis = result.analysis || 'No analysis available';
  
      // Display the analysis result in a modal or alert
      alert('Analysis: ' + analysis);
  
      if (data.email) {
        // Send email if email is provided
        await sendEmail(data.email, analysis);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('An error occurred while analyzing the token.');
    }
  });
  
  async function sendEmail(email, analysis) {
    try {
      const response = await fetch('/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, analysis })
      });
  
      if (!response.ok) {
        throw new Error('Failed to send email');
      }
  
      alert('Email sent successfully');
    } catch (error) {
      console.error('Error:', error);
      alert('An error occurred while sending the email.');
    }
  }
  