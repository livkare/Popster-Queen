import QRCode from 'qrcode';

export async function generateQRCode(url: string, container: HTMLElement): Promise<void> {
  try {
    // Show loading state
    container.innerHTML = '<p style="color: var(--color-text-base);">Generating QR code...</p>';
    
    const canvas = document.createElement('canvas');
    await QRCode.toCanvas(canvas, url, {
      width: 300,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    });

    // Clear container and add canvas
    container.innerHTML = '';
    container.appendChild(canvas);
    
    // Ensure canvas is visible
    canvas.style.display = 'block';
    canvas.style.width = '100%';
    canvas.style.maxWidth = '300px';
    canvas.style.height = 'auto';
    
    console.log('QR code generated successfully for URL:', url);
  } catch (error) {
    console.error('Error generating QR code:', error);
    container.innerHTML = '<p style="color: var(--color-text-base); padding: var(--space-4);">Error generating QR code. Please refresh the page.</p>';
  }
}


