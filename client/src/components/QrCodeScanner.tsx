import React, { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { Button } from '@/components/ui/button';
import { ScanLine, Camera, X, ZapOff } from 'lucide-react';

interface QrCodeScannerProps {
  onScanSuccess: (decodedText: string) => void;
  onClose: () => void;
  className?: string;
}

const QrCodeScanner: React.FC<QrCodeScannerProps> = ({ 
  onScanSuccess, 
  onClose,
  className = ""
}) => {
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [permissions, setPermissions] = useState<boolean>(false);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Initialize scanner
  useEffect(() => {
    if (!containerRef.current) return;

    // Create unique ID for the element
    const scannerId = 'qr-reader-' + Math.random().toString(36).substring(2, 9);
    
    // Create a div for the scanner
    const scannerDiv = document.createElement('div');
    scannerDiv.id = scannerId;
    containerRef.current.appendChild(scannerDiv);
    
    // Initialize HTML5 QR scanner
    scannerRef.current = new Html5Qrcode(scannerId);
    
    return () => {
      // Clean up when component unmounts
      if (scannerRef.current && scannerRef.current.isScanning) {
        scannerRef.current.stop().catch(error => {
          console.error("Failed to stop scanner:", error);
        });
      }
      
      if (containerRef.current && containerRef.current.contains(scannerDiv)) {
        containerRef.current.removeChild(scannerDiv);
      }
    };
  }, []);

  // Start scanning
  const startScanner = async () => {
    if (!scannerRef.current) return;
    
    setError(null);
    setIsScanning(true);
    
    try {
      // Request camera permission
      await navigator.mediaDevices.getUserMedia({ video: true });
      setPermissions(true);
      
      const config = {
        fps: 10,
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0,
      };
      
      await scannerRef.current.start(
        { facingMode: "environment" }, // Use back camera if available
        config,
        (decodedText) => {
          // Check if the QR code is a lightning invoice
          if (decodedText.startsWith('lightning:')) {
            // Remove the lightning: prefix
            onScanSuccess(decodedText.substring(10));
          } else if (decodedText.toLowerCase().startsWith('lnbc')) {
            // It's already a bare invoice
            onScanSuccess(decodedText);
          } else {
            setError("QR code is not a valid Lightning invoice");
          }
          stopScanner();
        },
        () => {
          // QR code not detected yet - don't need to do anything
        }
      );
    } catch (err) {
      console.error("Scanner error:", err);
      setError(err instanceof Error ? err.message : "Failed to access camera");
      setIsScanning(false);
    }
  };

  // Stop scanning
  const stopScanner = async () => {
    if (scannerRef.current && scannerRef.current.isScanning) {
      try {
        await scannerRef.current.stop();
      } catch (error) {
        console.error("Failed to stop scanner:", error);
      }
    }
    setIsScanning(false);
  };

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-lg ${className}`}>
      <div className="p-4 border-b dark:border-gray-700 flex justify-between items-center">
        <h3 className="font-medium flex items-center">
          <Camera className="mr-2 h-5 w-5 text-bitcoin-orange" />
          QR Code Scanner
        </h3>
        <button 
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        >
          <X className="h-5 w-5" />
        </button>
      </div>
      
      <div className="p-4">
        <div 
          ref={containerRef} 
          className="aspect-square w-full max-w-xs mx-auto relative bg-black rounded-lg overflow-hidden"
        >
          {/* Scanner animation */}
          {isScanning && (
            <div className="absolute inset-0 z-10 pointer-events-none">
              <div className="absolute top-0 left-0 right-0 h-1 bg-bitcoin-orange/30"></div>
              <div 
                className="absolute left-0 right-0 h-0.5 bg-bitcoin-orange animate-scanner-line" 
                style={{
                  boxShadow: '0 0 10px rgba(247, 147, 26, 0.7), 0 0 5px rgba(247, 147, 26, 0.5)'
                }}
              ></div>
            </div>
          )}
          
          {/* Permission denied or error state */}
          {!isScanning && error && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900/80 z-20 p-4">
              <ZapOff className="h-12 w-12 text-red-500 mb-3" />
              <p className="text-white text-center">{error}</p>
              <Button 
                onClick={startScanner} 
                variant="outline"
                className="mt-4 bg-white text-gray-900"
              >
                Try Again
              </Button>
            </div>
          )}
          
          {/* Initial state */}
          {!isScanning && !error && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900/80 z-20 p-4">
              <ScanLine className="h-12 w-12 text-bitcoin-orange mb-3" />
              <p className="text-white text-center">
                Scan a Lightning invoice QR code to make a payment
              </p>
              <Button 
                onClick={startScanner} 
                className="mt-4 btn-bitcoin"
              >
                Start Camera
              </Button>
            </div>
          )}
        </div>
        
        {isScanning && (
          <div className="mt-4 flex justify-center">
            <Button 
              onClick={stopScanner} 
              variant="outline" 
              size="sm"
            >
              Cancel
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default QrCodeScanner;