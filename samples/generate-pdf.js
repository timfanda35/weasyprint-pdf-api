const fs = require('fs');
const path = require('path');
const fetch = require('node-fetch');

async function generatePDF(htmlFilePath) {
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

        // Send the request to the PDF generation endpoint
        const response = await fetch('http://localhost:8000/pdfs', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
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

// Check if filename is provided
if (process.argv.length < 3) {
    console.error('Please provide an HTML file path as an argument');
    console.error('Usage: node generate-pdf.js <path-to-html-file>');
    process.exit(1);
}

// Get the file path from command line arguments
const htmlFilePath = process.argv[2];

// Run the function with the provided file path
generatePDF(htmlFilePath); 
