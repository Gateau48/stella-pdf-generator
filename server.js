const express = require('express');
const puppeteer = require('puppeteer');
const bodyParser = require('body-parser');
const fs = require('fs');

const app = express();
app.use(bodyParser.json());

app.post('/generate', async (req, res) => {
  const { prenom, message } = req.body;

  // Charger le template HTML
  let template = fs.readFileSync('template.html', 'utf8');
  template = template
    .replace('{{prenom}}', prenom)
    .replace('{{message}}', message);

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox']
  });
  const page = await browser.newPage();
  await page.setContent(template, { waitUntil: 'networkidle0' });
  const pdfBuffer = await page.pdf({ format: 'A4' });
  await browser.close();

  res.set({
    'Content-Type': 'application/pdf',
    'Content-Disposition': 'inline; filename="citation.pdf"',
  });

  res.send(pdfBuffer);
});

app.listen(3000, () => {
  console.log('Serveur en ligne sur le port 3000');
});
