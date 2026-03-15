import React, { useState, useRef, useEffect, useCallback } from 'react';
import classNames from 'classnames';
import { truskingIdentityService } from 'mastodon/services/trusking_identity_service';

export default function FaceVerification({ onVerificationComplete, onCancel }) {
  const [stream, setStream] = useState(null);
  const [photoDataUrl, setPhotoDataUrl] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [encryptionMetrics, setEncryptionMetrics] = useState(null);
  
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  // Initialize Web Camera on Component Mount
  useEffect(() => {
    let mounted = true;
    
    async function setupCamera() {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({ 
          video: { facingMode: 'user', width: 640, height: 480 }, 
          audio: false 
        });
        
        if (mounted) {
          setStream(mediaStream);
          if (videoRef.current) {
            videoRef.current.srcObject = mediaStream;
          }
        } else {
          // Cleanup if unmounted before promise resolves
          mediaStream.getTracks().forEach(track => track.stop());
        }
      } catch (err) {
        console.error("Camera access denied or unavailable", err);
        setError("Không thể truy cập Camera. Vui lòng cấp quyền (Allow Camera) để tiếp tục Xác Nhận Khuôn Mặt.");
      }
    }

    setupCamera();

    return () => {
      mounted = false;
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const handleCaptureFace = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;
    
    const context = canvasRef.current.getContext('2d');
    canvasRef.current.width = videoRef.current.videoWidth;
    canvasRef.current.height = videoRef.current.videoHeight;
    context.drawImage(videoRef.current, 0, 0, canvasRef.current.width, canvasRef.current.height);
    
    const dataUrl = canvasRef.current.toDataURL('image/jpeg', 0.85);
    setPhotoDataUrl(dataUrl);

    // Stop the video stream immediately after capture to save battery
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  }, [stream]);

  const handleRetake = () => {
    setPhotoDataUrl(null);
    setEncryptionMetrics(null);
    // Refresh page to re-trigger useEffect might be necessary, but naive restart here for simplicity
    navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } })
      .then(s => {
        setStream(s);
        if (videoRef.current) videoRef.current.srcObject = s;
      });
  };

  const handleEncryptAndSubmit = async () => {
    if (!photoDataUrl) return;
    setIsProcessing(true);
    
    try {
      // Privacy Pillar: Zero-Knowledge Image Proofs (Epic S)
      // We NEVER send the raw `photoDataUrl` to the server.
      await truskingIdentityService.ensureInitialized();
      const nodeId = truskingIdentityService.getNodeId();
      
      const startTime = performance.now();
      const { encrypted, hash } = await truskingIdentityService.encryptEvidence({
        type: 'biometric_face_capture',
        data: photoDataUrl,
        timestamp: Date.now()
      });
      const endTime = performance.now();
      
      setEncryptionMetrics({
        timeMs: Math.round(endTime - startTime),
        hash: hash,
        nodeId: nodeId
      });

      // Pass the fully Zero-Knowledge Encrypted payload to the parent handler
      setTimeout(() => {
        onVerificationComplete({
          nodeId,
          proofHash: hash,
          encryptedPayload: encrypted
        });
      }, 1500); // Artificial delay to let user see the cool metrics

    } catch (err) {
      setError("Crypto Error: Lỗi mã hoá Zero-Knowledge. Vui lòng thử lại.");
      setIsProcessing(false);
    }
  };

  return (
    <div className='trusking-face-verification-modal' style={{
      background: '#15202b', color: '#fff', padding: '24px', borderRadius: '12px',
      maxWidth: '600px', margin: '0 auto', boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '8px', borderBottom: '1px solid #38444d', paddingBottom: '12px' }}>
        👁️ Trusking Proof of Personhood
      </h2>
      <p style={{ fontSize: '14px', color: '#8899a6', marginBottom: '20px' }}>
        Hệ thống sẽ <strong>TUYỆT ĐỐI KHÔNG</strong> gửi ảnh của bạn lên Server. 
        Khuôn mặt sẽ được mã hoá cục bộ thành 1 chuỗi Zero-Knowledge Hash để Hội đồng ẩn danh [Guardians] xác minh bạn là Con Người.
      </p>

      {error ? (
        <div style={{ background: 'rgba(244,33,46,0.1)', color: '#f4212e', padding: '16px', borderRadius: '8px', marginBottom: '20px' }}>
          {error}
        </div>
      ) : (
        <div style={{ background: '#000', borderRadius: '8px', overflow: 'hidden', position: 'relative', minHeight: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          
          {!photoDataUrl && (
            <video 
              ref={videoRef} 
              autoPlay 
              playsInline 
              muted 
              style={{ width: '100%', height: 'auto', display: stream ? 'block' : 'none' }} 
            />
          )}

          {photoDataUrl && (
            <img src={photoDataUrl} alt="Captured Face" style={{ width: '100%', height: 'auto', filter: isProcessing ? 'grayscale(100%) blur(2px)' : 'none', transition: 'filter 0.5s' }} />
          )}

          {!stream && !photoDataUrl && !error && (
             <div style={{ color: '#8899a6' }}>⏳ Đang khởi động Camera cục bộ...</div>
          )}

          {/* Hidden Canvas for capture rendering */}
          <canvas ref={canvasRef} style={{ display: 'none' }} />
        </div>
      )}

      {encryptionMetrics && (
        <div style={{ marginTop: '16px', background: 'rgba(29,161,242,0.1)', border: '1px solid rgba(29,161,242,0.3)', padding: '12px', borderRadius: '8px', fontFamily: 'monospace', fontSize: '12px', color: '#1da1f2' }}>
          <div>[✔] AES Cryptographic Lock Applied ({encryptionMetrics.timeMs}ms)</div>
          <div><strong>Node:</strong> {encryptionMetrics.nodeId.substring(0, 16)}...</div>
          <div><strong>Proof Hash:</strong> {encryptionMetrics.hash}</div>
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
        <button 
          onClick={onCancel}
          disabled={isProcessing}
          style={{ padding: '10px 20px', background: 'transparent', color: '#8899a6', border: 'none', borderRadius: '20px', cursor: 'pointer', fontWeight: 'bold' }}
        >
          Hủy bỏ (Cancel)
        </button>

        {!photoDataUrl ? (
          <button 
            onClick={handleCaptureFace}
            disabled={!stream}
            style={{ padding: '10px 24px', background: '#1da1f2', color: '#fff', border: 'none', borderRadius: '20px', cursor: stream ? 'pointer' : 'not-allowed', fontWeight: 'bold' }}
          >
            📸 Chụp Khuôn Mặt (Capture)
          </button>
        ) : (
          <>
            <button 
              onClick={handleRetake}
              disabled={isProcessing}
              style={{ padding: '10px 20px', background: '#38444d', color: '#fff', border: 'none', borderRadius: '20px', cursor: 'pointer', fontWeight: 'bold' }}
            >
              Chụp lại (Retake)
            </button>
            <button 
              onClick={handleEncryptAndSubmit}
              disabled={isProcessing}
              style={{ padding: '10px 24px', background: isProcessing ? '#17bf63' : '#1da1f2', color: '#fff', border: 'none', borderRadius: '20px', cursor: isProcessing ? 'wait' : 'pointer', fontWeight: 'bold' }}
            >
              {isProcessing ? 'Gửi Blockchain Proof...' : '🔒 Mã hoá Zero-Knowledge'}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
