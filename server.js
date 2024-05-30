import 'dotenv/config';
import express from 'express';
import fetch from 'node-fetch';
import nodemailer from 'nodemailer';
import bodyParser from 'body-parser';
import path from 'path';
import { fileURLToPath } from 'url';

const app = express();
app.use(bodyParser.json());

// Serve static files from the "public" directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use(express.static(path.join(__dirname, 'public')));

// Handle root URL
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const EMAIL_SERVICE_USER = process.env.EMAIL_SERVICE_USER;
const EMAIL_SERVICE_PASS = process.env.EMAIL_SERVICE_PASS;

// Endpoint to analyze the form data using OpenAI API
app.post('/analyze', async (req, res) => {
  const {
    tokenName, tokenSymbol, websiteUrl, teamBackground, whitepaperQuality,
    tokenomics, technology, communityMarketing, roadmapMilestones,
    defi, nfts, gaming, other, additionalInfo
  } = req.body;

  const prompt = `
    Analyze this small-cap token project:
    Token Name: ${tokenName}
    Token Symbol: ${tokenSymbol}
    Website: ${websiteUrl}
    Team Background: ${teamBackground}
    Whitepaper Quality: ${whitepaperQuality}
    Tokenomics: ${tokenomics}
    Technology: ${technology}
    Community and Marketing: ${communityMarketing}
    Roadmap and Milestones: ${roadmapMilestones}
    DeFi Focus: ${defi}
    NFTs Focus: ${nfts}
    Gaming Focus: ${gaming}
    Other Focus: ${other}
    Additional Information: ${additionalInfo}
    
    Key Analysis Points:
    * Rate the project overall on a scale of 1-10.
    * Assess the team's experience and credibility.
    * Evaluate the clarity and feasibility of the whitepaper.
    * Analyze the tokenomics for fairness and sustainability.
    * Comment on the project's technology choice.
    * Rate the community engagement and marketing efforts.
    * Assess the roadmap's clarity and ambition.
    * Note any strengths or weaknesses.
    * Provide an overall summary and recommendation.
  `;

  try {
    const response = await fetch('https://api.openai.com/v1/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo-instruct',
        prompt: prompt,
        max_tokens: 500
      })
    });

    const data = await response.json();
    const analysis = data.choices[0].text.trim();
    res.json({ analysis });
  } catch (error) {
    console.error('Error fetching data from OpenAI API:', error);
    res.status(500).json({ error: 'Error fetching data from OpenAI API' });
  }
});

// Endpoint to send email with the analysis
app.post('/send-email', async (req, res) => {
  const { email, analysis } = req.body;

  let transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: EMAIL_SERVICE_USER,
      pass: EMAIL_SERVICE_PASS
    }
  });

  let mailOptions = {
    from: EMAIL_SERVICE_USER,
    to: email,
    subject: 'Token Analysis Report',
    text: analysis
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error('Error sending email:', error);
      return res.status(500).send('Error sending email: ' + error.toString());
    }
    res.status(200).send('Email sent: ' + info.response);
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
