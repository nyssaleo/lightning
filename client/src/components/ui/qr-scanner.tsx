import React, { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';

interface QRScannerProps {
  onScan: (data: string) => void;
  onClose: () => void;
  isOpen: boolean;
}

export function QRScanner({ onScan, onClose, isOpen }: QRScannerProps) {
  const [error, setError] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const scannerContainerRef = useRef<HTMLDivElement>(null);
  const scannerRef = useRef<Html5Qrcode | null>(null);

  // Initialize QR scanner when component mounts
  useEffect(() => {
    if (!isOpen) return;

    let html5QrCode: Html5Qrcode | null = null;
    
    // Initialize the scanner
    const initializeScanner = async () => {
      try {
        if (!scannerContainerRef.current) return;
        
        const scannerId = 'qr-reader';
        
        // Check if the scanner element already exists
        let scannerElement = document.getElementById(scannerId);
        if (!scannerElement) {
          // Create scanner element if it doesn't exist
          scannerElement = document.createElement('div');
          scannerElement.id = scannerId;
          scannerContainerRef.current.appendChild(scannerElement);
        }
        
        // Initialize the scanner
        html5QrCode = new Html5Qrcode(scannerId);
        scannerRef.current = html5QrCode;
        
        // Start scanning from camera
        const cameraId = await getCameraId();
        if (!cameraId) {
          setError("No camera found. Please ensure camera access is allowed.");
          return;
        }
        
        await html5QrCode.start(
          { facingMode: "environment" }, // Use back camera when available
          {
            fps: 10,
            qrbox: 250,
            aspectRatio: 1.0,
            disableFlip: false,
          },
          handleScanSuccess,
          handleScanFailure
        );
        
        setIsInitialized(true);
      } catch (e) {
        console.error('QR Scanner initialization error:', e);
        setError('Failed to initialize camera. Please ensure camera permissions are granted.');
      }
    };
    
    // Get available camera device id
    const getCameraId = async (): Promise<string | null> => {
      try {
        const devices = await Html5Qrcode.getCameras();
        if (devices && devices.length) {
          // Prefer back camera (usually the last in the list)
          return devices[devices.length - 1].id;
        } else {
          return null;
        }
      } catch (e) {
        console.error('Error getting cameras:', e);
        return null;
      }
    };
    
    // Initialize the scanner
    initializeScanner();
    
    // Clean up when component unmounts
    return () => {
      if (html5QrCode && html5QrCode.isScanning) {
        html5QrCode.stop().then(() => {
          console.log('QR scanner stopped');
        }).catch(err => {
          console.error('Failed to stop QR scanner:', err);
        });
      }
    };
  }, [isOpen]);
  
  // Handle successful QR scan
  const handleScanSuccess = (decodedText: string) => {
    // Stop scanning
    if (scannerRef.current && scannerRef.current.isScanning) {
      scannerRef.current.stop().then(() => {
        // Call the onScan callback with the decoded text
        onScan(decodedText);
      }).catch(err => {
        console.error('Failed to stop QR scanner:', err);
      });
    }
  };
  
  // Handle scan failures (just for logging)
  const handleScanFailure = (error: string) => {
    // Don't show error to user as this fires constantly while searching for QR code
    console.debug('QR scan error:', error);
  };
  
  return (
    <div className="w-full h-72 bg-gray-900 rounded-lg overflow-hidden relative">
      {/* Scanner container */}
      <div 
        ref={scannerContainerRef} 
        className="w-full h-full flex items-center justify-center overflow-hidden"
      />
      
      {/* Scan line animation */}
      <div className="absolute left-0 w-full h-0.5 bg-red-500 opacity-70 animate-scanner-line" />
      
      {/* Error message */}
      {error && (
        <div className="absolute inset-0 bg-black/70 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg max-w-xs">
            <p className="text-red-500 font-medium mb-2">Camera Error</p>
            <p className="text-sm">{error}</p>
          </div>
        </div>
      )}
      
      {/* Loading state */}
      {isOpen && !isInitialized && !error && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
          <div className="text-white text-center">
            <div className="w-8 h-8 border-2 border-t-bitcoin-orange border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin mx-auto mb-2"></div>
            <p className="text-sm">Initializing camera...</p>
          </div>
        </div>
      )}
      
      {/* Scan guide overlay */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="w-64 h-64 mx-auto mt-4 border-2 border-dashed border-white/50 rounded-lg"></div>
      </div>
    </div>
  );
}