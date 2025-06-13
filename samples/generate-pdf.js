const fs = require('fs');
const path = require('path');
const fetch = require('node-fetch');
const minimist = require('minimist');

async function generatePDF(htmlFilePath, serverUrl = 'http://localhost:8000', apiKey = null) {
    try {
        // Check if file exists
        if (!fs.existsSync(htmlFilePath)) {
            throw new Error(`File not found: ${htmlFilePath}`);
        }

        // Read the HTML file
        const htmlContent = fs.readFileSync(htmlFilePath, 'utf8');

        // Get the base filename without extension for the PDF name
        const baseFilename = path.basename(htmlFilePath, path.extname(htmlFilePath));

        // Prepare the request payload
        const payload = {
            filename: baseFilename,
            html: htmlContent
        };

        const headers = {
            'Content-Type': 'application/json'
        };

        if (apiKey) {
            headers['x-api-key'] = apiKey;
        }

        // Send the request to the PDF generation endpoint
        const response = await fetch(`${serverUrl}/pdfs`, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        // Get the PDF buffer
        const pdfBuffer = await response.buffer();
        
        // Save the PDF file
        const outputPath = path.join(path.dirname(htmlFilePath), `${baseFilename}.pdf`);
        fs.writeFileSync(outputPath, pdfBuffer);
        
        console.log(`PDF generated successfully and saved to: ${outputPath}`);
    } catch (error) {
        console.error('Error generating PDF:', error);
        process.exit(1);
    }
}

// Parse command line arguments
const argv = minimist(process.argv.slice(2), {
    string: ['server', 'api-key'],
    alias: { 
        s: 'server',
        k: 'api-key'
    }
});

// Check if filename is provided
if (argv._.length === 0) {
    console.error('Please provide an HTML file path as an argument');
    console.error('Usage: node generate-pdf.js [--server <url>] [--api-key <key>] <path-to-html-file>');
    process.exit(1);
}

// Get the file path from command line arguments
const htmlFilePath = argv._[0];
const serverUrl = argv.server || 'http://localhost:8000';
const apiKey = argv['api-key'] || null;

// Run the function with the provided file path, server URL, and API key
generatePDF(htmlFilePath, serverUrl, apiKey); 
