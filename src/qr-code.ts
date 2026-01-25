import QRCode from 'qrcode';

export async function generateQRCode(url: string, container: HTMLElement): Promise<void> {
  try {
    console.log('Generating QR code for URL:', url);
    console.log('Container element:', container);
    
    // Show loading state
    container.innerHTML = '<p style="color: #000000; text-align: center; padding: 1rem;">Generating QR code...</p>';
    
    // Wait a bit to ensure DOM is ready
    await new Promise(resolve => setTimeout(resolve, 50));
    
    // Try canvas approach first
    try {
      const canvas = document.createElement('canvas');
      
      // Generate QR code
      console.log('Calling QRCode.toCanvas...');
      await QRCode.toCanvas(canvas, url, {
        width: 300,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        },
        errorCorrectionLevel: 'M'
      });

      console.log('QR code generated, canvas dimensions:', canvas.width, 'x', canvas.height);
      
      // Clear container and add canvas
      container.innerHTML = '';
      
      // Set canvas styles
      canvas.style.display = 'block';
      canvas.style.width = '300px';
      canvas.style.height = '300px';
      canvas.style.margin = '0 auto';
      
      // Add canvas to container
      container.appendChild(canvas);
      
      console.log('QR code added to container. Container children:', container.children.length);
      
      // Verify canvas is in DOM
      if (!container.contains(canvas)) {
        throw new Error('Canvas was not added to container');
      }
      
      return;
    } catch (canvasError) {
      console.warn('Canvas approach failed, trying image approach:', canvasError);
      
      // Fallback to image approach
      const dataUrl = await QRCode.toDataURL(url, {
        width: 300,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        },
        errorCorrectionLevel: 'M'
      });
      
      container.innerHTML = '';
      const img = document.createElement('img');
      img.src = dataUrl;
      img.alt = 'QR Code';
      img.style.display = 'block';
      img.style.width = '300px';
      img.style.height = '300px';
      img.style.margin = '0 auto';
      
      container.appendChild(img);
      console.log('QR code image added to container');
    }
    
  } catch (error) {
    console.error('Error generating QR code:', error);
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
    container.innerHTML = `<p style="color: #000000; padding: var(--space-4); text-align: center;">Error: ${error instanceof Error ? error.message : 'Failed to generate QR code'}</p>`;
  }
}


