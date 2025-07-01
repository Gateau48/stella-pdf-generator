const express = require('express');
const bodyParser = require('body-parser');
const puppeteer = require('puppeteer-core');
const chromium = require('chrome-aws-lambda');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());

app.post('/generate', async (req, res) => {
  const { prenom, message } = req.body;

  try {
    const browser = await puppeteer.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath || '/usr/bin/google-chrome',
      headless: chromium.headless,
    });

    const page = await browser.newPage();

    // Charge un HTML personnalisé depuis un template (voir template.html)
    const htmlContent = `
      <!DOCTYPE html>
      <html lang="fr">
      <head>
        <meta charset="UTF-8" />
        <style>
          body {
            font-family: 'Georgia', serif;
            display: flex;
            justify-content: center;
            align-items: center;
            flex-direction: column;
            height: 100vh;
            padding: 2rem;
            background-color: #fdfcf9;
          }
          h1 {
            font-size: 2.5rem;
            color: #222;
          }
          p {
            font-size: 1.2rem;
            margin-top: 1rem;
            max-width: 600px;
            text-align: center;
            color: #555;
          }
        </style>
      </head>
      <body>
        <h1>${prenom}</h1>
        <p>${message}</p>
      </body>
      </html>
    `;

    await page.setContent(htmlContent, { waitUntil: 'networkidle0' });

    const pdfBuffer = await page.pdf({ format: 'A4' });

    await browser.close();

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${prenom}_quote.pdf"`,
    });

    res.send(pdfBuffer);
  } catch (error) {
    console.error('Erreur de génération :', error);
    res.status(500).send('Une erreur est survenue lors de la génération du PDF.');
  }
});

app.listen(PORT, () => {
  console.log(`Serveur en ligne sur le port ${PORT}`);
});
